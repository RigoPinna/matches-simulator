import type { TAction } from '../Seasson/seassonReducer';
import type {
	IClub,
	TMatches,
	TState,
	TWorldCup,
	TWorldCupStage,
} from '../Seasson/SeassonContext';
import type { TIntlLeague } from '../Seasson/leagues';
import {
	applyMatchesToTable,
	buildNextRound,
	drawGroups,
	drawQuarterfinals,
	getWinner,
	isMyClub,
	safeSetItem,
	simulateMatch,
} from '../../helpers';

export type TWorldCupActionType =
	| '[WORLDCUP] - DRAW GROUPS'
	| '[WORLDCUP] - START GROUPS'
	| '[WORLDCUP] - SIMULATE GROUP JOURNEY'
	| '[WORLDCUP] - DRAW KNOCKOUT'
	| '[WORLDCUP] - START KNOCKOUT'
	| '[WORLDCUP] - SIMULATE ROUND'
	| '[WORLDCUP] - NEXT ROUND'
	| '[WORLDCUP] - ADD MY SCORE'
	| '[WORLDCUP] - CLOSE';

/** Payload of every World Cup action except ADD MY SCORE. */
export type TWorldCupPayload = { wid: string };
export type TWorldCupAddMyScore = {
	wid: string;
	matchUuid: string;
	local: number;
	visit: number;
};

type TKnockoutField = 'quarterfinals' | 'semifinals' | 'final';
const KNOCKOUT_FIELD: Partial<Record<TWorldCupStage, TKnockoutField>> = {
	QUARTERS: 'quarterfinals',
	SEMIS: 'semifinals',
	FINAL: 'final',
};

export const isKnockoutStage = (stage: TWorldCupStage) => stage in KNOCKOUT_FIELD;

/** Matches of the knockout round being played (empty outside knockout stages). */
export const getCurrentRound = (worldCup: TWorldCup): TMatches[] => {
	const field = KNOCKOUT_FIELD[worldCup.stage];
	return field ? worldCup[field] : [];
};

export const isGroupStageFinished = (worldCup: TWorldCup) =>
	worldCup.groups.length > 0 && worldCup.groupJourney >= worldCup.groups[0].journeys.length;

export const getCurrentWorldCup = (worldCups: TWorldCup[]) => worldCups.find(wc => wc.isCurrent);

/**
 * Applies `mapper` to every still-pending match of the current group
 * matchday (all 4 groups at once, so the groups stay in sync) and updates
 * each group table with the matches that just got a score.
 */
const updateGroupMatches = (wc: TWorldCup, mapper: (match: TMatches) => TMatches): TWorldCup => {
	const j = wc.groupJourney;
	const groups = wc.groups.map(group => {
		const journey = group.journeys[j];
		if (!journey) return group;
		const newlyDone: TMatches[] = [];
		const value = journey.value.map(match => {
			if (match.status === 'DONE') return match;
			const next = mapper(match);
			if (next.status === 'DONE') newlyDone.push(next);
			return next;
		});
		if (newlyDone.length === 0) return group;
		const status = value.every(match => match.status === 'DONE') ? 'DONE' : 'TODO';
		return {
			...group,
			table: applyMatchesToTable(group.table, newlyDone),
			journeys: group.journeys.map((jr, i) => (i === j ? { ...jr, value, status } : jr)),
		} as typeof group;
	});
	const matchdayDone = groups.every(group => group.journeys[j]?.status === 'DONE');
	return { ...wc, groups, groupJourney: matchdayDone ? j + 1 : j };
};

const updateRoundMatches = (wc: TWorldCup, mapper: (match: TMatches) => TMatches): TWorldCup => {
	const field = KNOCKOUT_FIELD[wc.stage];
	if (!field) return wc;
	return {
		...wc,
		[field]: wc[field].map(match => (match.status === 'DONE' ? match : mapper(match))),
	};
};

/** +1 World Cup to the club, in whichever roster it currently belongs to. */
const bumpWorldCupTrophy = (state: TState, uuid: string): Partial<TState> => {
	const bump = (clubs: IClub[]) => {
		if (!clubs.some(club => club.uuid === uuid)) return clubs;
		return clubs.map(club =>
			club.uuid === uuid ? { ...club, worldCups: (club.worldCups || 0) + 1 } : club,
		);
	};
	const clubs = bump(state.clubs);
	const plateClubs = bump(state.plateClubs);
	const intlClubs = Object.fromEntries(
		Object.entries(state.intlClubs).map(([league, roster]) => [league, bump(roster)]),
	) as Record<TIntlLeague, IClub[]>;

	if (clubs !== state.clubs) safeSetItem('clubs', JSON.stringify(clubs));
	if (plateClubs !== state.plateClubs) safeSetItem('plateClubs', JSON.stringify(plateClubs));
	if (Object.keys(intlClubs).some(l => intlClubs[l as TIntlLeague] !== state.intlClubs[l as TIntlLeague])) {
		safeSetItem('intlClubs', JSON.stringify(intlClubs));
	}
	return { clubs, plateClubs, intlClubs };
};

const withWorldCup = (
	state: TState,
	wid: string,
	update: (wc: TWorldCup) => { worldCup: TWorldCup; extra?: Partial<TState> } | null,
): TState => {
	const current = state.worldCups.find(wc => wc.uuid === wid);
	if (!current) return state;
	const result = update(current);
	if (!result || result.worldCup === current) return state;
	const worldCups = state.worldCups.map(wc => (wc.uuid === wid ? result.worldCup : wc));
	safeSetItem('worldCups', JSON.stringify(worldCups));
	return { ...state, ...result.extra, worldCups };
};

/**
 * Handles every '[WORLDCUP] - *' action; returns undefined for any other
 * action so the season reducer can fall through to its default.
 */
export const worldCupReducer = (state: TState, action: TAction): TState | undefined => {
	const myClub = state.myClub as IClub;
	switch (action.type) {
		case '[WORLDCUP] - DRAW GROUPS': {
			const { wid } = action.payload as TWorldCupPayload;
			return withWorldCup(state, wid, wc => {
				if (wc.stage !== 'GROUP_DRAW' || wc.groups.length > 0) return null;
				return { worldCup: { ...wc, ...drawGroups(wc.qualifiers) } };
			});
		}
		case '[WORLDCUP] - START GROUPS': {
			const { wid } = action.payload as TWorldCupPayload;
			return withWorldCup(state, wid, wc =>
				wc.stage === 'GROUP_DRAW' && wc.groups.length > 0
					? { worldCup: { ...wc, stage: 'GROUPS' } }
					: null,
			);
		}
		case '[WORLDCUP] - SIMULATE GROUP JOURNEY': {
			const { wid } = action.payload as TWorldCupPayload;
			return withWorldCup(state, wid, wc => {
				if (wc.stage !== 'GROUPS' || isGroupStageFinished(wc)) return null;
				return {
					worldCup: updateGroupMatches(wc, match =>
						isMyClub(match, myClub) ? match : simulateMatch(match, false),
					),
				};
			});
		}
		case '[WORLDCUP] - DRAW KNOCKOUT': {
			const { wid } = action.payload as TWorldCupPayload;
			return withWorldCup(state, wid, wc => {
				if (wc.stage !== 'GROUPS' || !isGroupStageFinished(wc)) return null;
				return {
					worldCup: { ...wc, stage: 'KNOCKOUT_DRAW', quarterfinals: drawQuarterfinals(wc.groups) },
				};
			});
		}
		case '[WORLDCUP] - START KNOCKOUT': {
			const { wid } = action.payload as TWorldCupPayload;
			return withWorldCup(state, wid, wc =>
				wc.stage === 'KNOCKOUT_DRAW' ? { worldCup: { ...wc, stage: 'QUARTERS' } } : null,
			);
		}
		case '[WORLDCUP] - SIMULATE ROUND': {
			const { wid } = action.payload as TWorldCupPayload;
			return withWorldCup(state, wid, wc => ({
				worldCup: updateRoundMatches(wc, match =>
					isMyClub(match, myClub) ? match : simulateMatch(match, true),
				),
			}));
		}
		case '[WORLDCUP] - ADD MY SCORE': {
			const { wid, matchUuid, local, visit } = action.payload as TWorldCupAddMyScore;
			return withWorldCup(state, wid, wc => {
				const knockout = isKnockoutStage(wc.stage);
				// Knockout matches always need a winner.
				if (knockout && local === visit) return null;
				const mapper = (match: TMatches): TMatches =>
					match.uuid !== matchUuid
						? match
						: {
							...match,
							status: 'DONE',
							local: { ...match.local, score: local },
							visit: { ...match.visit, score: visit },
						};
				if (wc.stage === 'GROUPS') return { worldCup: updateGroupMatches(wc, mapper) };
				if (knockout) return { worldCup: updateRoundMatches(wc, mapper) };
				return null;
			});
		}
		case '[WORLDCUP] - NEXT ROUND': {
			const { wid } = action.payload as TWorldCupPayload;
			return withWorldCup(state, wid, wc => {
				const round = getCurrentRound(wc);
				if (round.length === 0 || round.some(match => match.status !== 'DONE')) return null;
				switch (wc.stage) {
					case 'QUARTERS':
						return { worldCup: { ...wc, stage: 'SEMIS', semifinals: buildNextRound(round) } };
					case 'SEMIS':
						return { worldCup: { ...wc, stage: 'FINAL', final: buildNextRound(round) } };
					case 'FINAL': {
						const champion = getWinner(round[0]).winner;
						return {
							worldCup: { ...wc, stage: 'FINISHED', champion },
							extra: bumpWorldCupTrophy(state, champion.uuid),
						};
					}
					default:
						return null;
				}
			});
		}
		case '[WORLDCUP] - CLOSE': {
			const { wid } = action.payload as TWorldCupPayload;
			return withWorldCup(state, wid, wc =>
				wc.stage === 'FINISHED' && wc.isCurrent ? { worldCup: { ...wc, isCurrent: false } } : null,
			);
		}
		default:
			return undefined;
	}
};
