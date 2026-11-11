import { v4 as getUuid } from 'uuid';
import {
	IClub,
	IItemTable,
	ITeamMatch,
	TFase,
	TJourney,
	TMatches,
	TSeason,
	TState,
	TStatusFase,
	TWorldCup,
	globalState,
} from './SeassonContext';
import {
	INTL_LEAGUES,
	SEASONS_PER_WORLD_CUP,
	TIntlLeague,
	TLeague,
	intlClubsDefaults,
} from './leagues';
import {
	aggregateTable,
	createWorldCup,
	getJourneys,
	getUnplayedWorldCupCycle,
	getWinner,
	isMyClub,
	orderMyTeam,
	orderTable,
	safeSetItem,
	buildImageLookup,
	sanitizeClubImages,
	sanitizeSeasonImages,
	sanitizeWorldCupImages,
	setSeasonsBatch,
} from '../../helpers';
import { getRandomScore } from '../../helpers/getRandomScore';
import {
	TWorldCupActionType,
	getCurrentWorldCup,
	worldCupReducer,
} from '../WorldCup/worldCupReducer';

export type TType =
	| '[SEASSON] - SET SEASSONS'
	| '[SEASSON] - NEW SEASSON'
	| '[SEASSON] - UPDATED STATUS FASE'
	| '[SEASSON] - UPDATE TABLE'
	| '[SEASSON-REGULAR] - ADD MATCH SCORE'
	| '[SEASSON-SEMIFINALS] - SET MATCHES'
	| '[SEASSON-SEMIFINALS] - ADD MATCH SCORE'
	| '[SEASSON-FINAL] - SET MATCHES'
	| '[SEASSON-FINAL] - ADD MATCH SCORE'
	| '[SEASSON] - FINISHED SEASON'
	| '[SEASSON] - ORDER TABLE'
	| '[SEASSON] - ADDED MY SCORE'
	| TWorldCupActionType;

export type TAction = {
	type: TType;
	payload?: any;
};
export type TBlockedFase = {
	sid: string;
	type: 'regular' | 'semifinal' | 'final';
	status: TStatusFase;
};
export type TAddMyScore = {
	sid: string;
	jid: string;
	type: 'regular' | 'semifinal' | 'final';
	match: TMatches;
};
export type TSeasonReducer = (state: TState, action: TAction) => TState;

// Club "sombra" usado para simular por completo la liga en la que myClub NO
// juega: como su uuid nunca matchea a nadie, isMyClub siempre da false y
// toda la lógica existente (orderTable, getScoreNoDraw, etc.) simula el 100%
// de los partidos en vez de dejar uno pendiente de marcador manual.
const NO_CLUB: IClub = { uuid: '__shadow__', name: 'Shadow', color: '#000000' };

/**
 * Every season created in the same "New season" click shares a pairId: the
 * user's own league plus all the leagues that are simulated in the
 * background (Plate Ligue / Primera and the three international leagues).
 */
const getPairSeasons = (season: TSeason, seasons: TSeason[]): TSeason[] => {
	if (!season.pairId) return [];
	return seasons.filter(s => s.pairId === season.pairId && s.uuid !== season.uuid);
};

const getNextJourney = (fase: TFase): TJourney | undefined => {
	return fase.matches.matches.find(journey => journey.status === 'TODO');
};

const countDoneJourneys = (fase: TFase): number => {
	return fase.matches.matches.filter(journey => journey.status === 'DONE').length;
};

// Catches the shadow (pair) season's regular phase up to `targetDone`
// completed journeys, simulating one full journey at a time (NO_CLUB means
// every match in it gets a random score, nothing held back for manual entry).
const syncShadowRegular = (pair: TSeason, targetDone: number): TSeason => {
	let current = pair;
	while (countDoneJourneys(current.fase.regular) < targetDone) {
		const journey = getNextJourney(current.fase.regular);
		if (!journey) break;
		current = applyRegularJourney(current, journey, NO_CLUB);
	}
	return current;
};

// Same idea for semifinal/final: these are single-journey, no-draw knockout
// rounds, so `targetDone` is effectively 0 or 1.
const syncShadowKnockout = (
	type: 'semifinal' | 'final',
	pair: TSeason,
	targetDone: number,
): TSeason => {
	let current = pair;
	while (countDoneJourneys(current.fase[type]) < targetDone) {
		const journey = getNextJourney(current.fase[type]);
		if (!journey) break;
		const result = updateMatchesNoDraw({
			type,
			uuid: current.uuid,
			matches: journey,
			seasons: [current],
			myClub: NO_CLUB,
		});
		current = applyKnockoutResult(type, result);
	}
	return current;
};

// Brings the shadow season's given phase up to however many journeys are
// already DONE in the interactive season's own copy of that phase. This is
// what keeps Plate Ligue in lockstep regardless of which action (bulk
// "Simulate" or myClub's own manual score) is what actually finished the
// journey on the interactive side — e.g. when myClub is one of only two
// finalists, there is no "other" match to Simulate, so the final can only
// ever be completed via ADDED MY SCORE, and the shadow still needs to catch
// up right then.
const syncShadowFase = (
	type: 'regular' | 'semifinal' | 'final',
	interactive: TSeason,
	pair: TSeason,
): TSeason => {
	const targetDone = countDoneJourneys(interactive.fase[type]);
	return type === 'regular'
		? syncShadowRegular(pair, targetDone)
		: syncShadowKnockout(type, pair, targetDone);
};

type TTrophyField = 'champions' | 'supercups' | 'plateChampions' | 'plateSupercups';
type TRosters = Pick<TState, 'clubs' | 'plateClubs' | 'intlClubs'>;

const pickRosters = ({ clubs, plateClubs, intlClubs }: TState): TRosters => ({
	clubs,
	plateClubs,
	intlClubs,
});

const bumpTrophy = (
	rosters: TRosters,
	league: TLeague,
	winnerUuid: string | undefined,
	field: 'champions' | 'supercups',
): TRosters => {
	if (!winnerUuid) return rosters;
	const apply = (arr: IClub[], targetField: TTrophyField) =>
		arr.map(club =>
			club.uuid === winnerUuid ? { ...club, [targetField]: (club[targetField] || 0) + 1 } : club,
		);
	if (league === 'PRIMERA') return { ...rosters, clubs: apply(rosters.clubs, field) };
	if (league === 'PLATE') {
		const plateField = `plate${field[0].toUpperCase()}${field.slice(1)}` as TTrophyField;
		return { ...rosters, plateClubs: apply(rosters.plateClubs, plateField) };
	}
	return {
		...rosters,
		intlClubs: { ...rosters.intlClubs, [league]: apply(rosters.intlClubs[league], field) },
	};
};

const persistRosters = (next: TRosters, prev: TRosters) => {
	if (next.clubs !== prev.clubs) safeSetItem('clubs', JSON.stringify(next.clubs));
	if (next.plateClubs !== prev.plateClubs) safeSetItem('plateClubs', JSON.stringify(next.plateClubs));
	if (next.intlClubs !== prev.intlClubs) safeSetItem('intlClubs', JSON.stringify(next.intlClubs));
};

/**
 * The hardcoded defaults are the source of truth for which clubs play each
 * international league and their name/color/logo; only the trophy counters
 * come from what's saved.
 */
const loadIntlClubs = (): Record<TIntlLeague, IClub[]> => {
	let saved: Partial<Record<TIntlLeague, IClub[]>> = {};
	try {
		saved = JSON.parse(localStorage.getItem('intlClubs') || '{}');
	} catch {
		saved = {};
	}
	return Object.fromEntries(
		INTL_LEAGUES.map(league => [
			league,
			intlClubsDefaults[league].map(club => {
				const savedClub = saved[league]?.find(c => c.uuid === club.uuid);
				return savedClub
					? { ...savedClub, name: club.name, color: club.color, image: club.image }
					: club;
			}),
		]),
	) as Record<TIntlLeague, IClub[]>;
};

const loadWorldCups = (): TWorldCup[] => {
	try {
		return JSON.parse(localStorage.getItem('worldCups') || '[]');
	} catch {
		return [];
	}
};

const applyRegularJourney = (season: TSeason, matches: TJourney, myClub: IClub): TSeason => {
	const matchesDone = matches.value.map(match => {
		return isMyClub(match, myClub) ? match : getRandomScore(match);
	});
	const matchesWithScore: TJourney = {
		jid: matches.jid,
		status: matchesDone.some(match => match.status === 'TODO') ? 'TODO' : 'DONE',
		value: matchesDone,
	};
	const tableOrded = orderTable(myClub, season.table, matchesWithScore);
	const currentJourney = season.fase.regular.currentJourney;
	const updatedJourneys = season.fase.regular.matches.matches.map(jry => {
		return jry.jid === matchesWithScore.jid ? matchesWithScore : jry;
	});
	const isActive = updatedJourneys.some(j => j.status === 'TODO');

	return {
		...season,
		table: [...tableOrded],
		fase: {
			...season.fase,
			regular: {
				...season.fase.regular,
				currentJourney: matchesWithScore.status === 'DONE' ? currentJourney + 1 : currentJourney,
				status: isActive ? 'ACTIVE' : 'FINISHED',
				matches: {
					...season.fase.regular.matches,
					matches: updatedJourneys,
				},
			},
		},
	};
};

const buildSemifinalSeason = (season: TSeason): TSeason => {
	const semifinals: TJourney = {
		jid: getUuid(),
		status: 'TODO',
		value: [
			{
				uuid: getUuid(),
				status: 'TODO',
				local: {
					...season.table[0].club,
					score: 0,
				},
				visit: {
					...season.table[3].club,
					score: 0,
				},
			},
			{
				uuid: getUuid(),
				status: 'TODO',
				local: {
					...season.table[1].club,
					score: 0,
				},
				visit: {
					...season.table[2].club,
					score: 0,
				},
			},
		],
	};

	const fase: TFase = {
		...season.fase.semifinal,
		status: 'ACTIVE',
		matches: {
			uuid: getUuid(),
			title: 'Semifinal',
			matches: [semifinals],
		},
	};

	return { ...season, fase: { ...season.fase, semifinal: fase } };
};

const buildFinalSeason = (season: TSeason): TSeason => {
	const winners =
		season.fase.semifinal?.winners?.map(club => {
			return {
				club,
				position: season.table.findIndex(item => item.club.uuid === club.uuid),
			};
		}) || [];
	const local = winners[0].position < winners[1].position ? winners[0].club : winners[1].club;
	const visitor = winners[0].position > winners[1].position ? winners[0].club : winners[1].club;
	const final: TJourney = {
		jid: getUuid(),
		status: 'TODO',
		value: [
			{
				uuid: getUuid(),
				status: 'TODO',
				local: {
					...local,
					score: 0,
				},
				visit: {
					...visitor,
					score: 0,
				},
			},
		],
	};
	const fase: TFase = {
		...season.fase.final,
		status: 'ACTIVE',
		matches: {
			uuid: getUuid(),
			title: 'Final',
			matches: [final],
		},
	};

	return { ...season, fase: { ...season.fase, final: fase } };
};

const finishSeason = (season: TSeason): TSeason => {
	return {
		...season,
		isCurrent: false,
		winner: season.fase.final?.winners
			? [
				{
					...season.table[0].club,
					score: 0,
				},
				season.fase.final.winners[0],
			]
			: null,
	};
};

const checkPromotionRelegation = (
	finishedNumber: number,
	seasons: TSeason[],
	clubs: IClub[],
	plateClubs: IClub[],
): { clubs: IClub[]; plateClubs: IClub[]; promoted?: IClub; relegated?: IClub } => {
	const primeraTable = aggregateTable(seasons, 'PRIMERA', finishedNumber);
	const plateTable = aggregateTable(seasons, 'PLATE', finishedNumber);
	if (primeraTable.length === 0 || plateTable.length === 0) return { clubs, plateClubs };

	const relegatedUuid = primeraTable[primeraTable.length - 1].club.uuid;
	const promotedUuid = plateTable[0].club.uuid;

	const relegatedClub = clubs.find(c => c.uuid === relegatedUuid);
	const promotedClub = plateClubs.find(c => c.uuid === promotedUuid);
	if (!relegatedClub || !promotedClub) return { clubs, plateClubs };

	return {
		clubs: [...clubs.filter(c => c.uuid !== relegatedUuid), promotedClub],
		plateClubs: [...plateClubs.filter(c => c.uuid !== promotedUuid), relegatedClub],
		promoted: promotedClub,
		relegated: relegatedClub,
	};
};

export const seassonReducer: TSeasonReducer = (state = globalState, action) => {
	switch (action.type) {
		case '[SEASSON] - SET SEASSONS': {
			const clubsSaved = localStorage.getItem('clubs');
			const loadedClubs = clubsSaved ? JSON.parse(clubsSaved) : state.clubs;
			const plateClubsSaved = localStorage.getItem('plateClubs');
			const loadedPlateClubs = plateClubsSaved ? JSON.parse(plateClubsSaved) : state.plateClubs;

			// Always built from the hardcoded module defaults, never from what's
			// saved — those defaults are the only thing guaranteed to reflect
			// the current build's (lightweight, external-file) image paths.
			const imageByUuid = buildImageLookup(
				globalState.clubs,
				globalState.plateClubs,
				...Object.values(intlClubsDefaults),
			);

			const sanitizedClubs = sanitizeClubImages(loadedClubs, imageByUuid);
			if (sanitizedClubs.changed) safeSetItem('clubs', JSON.stringify(sanitizedClubs.clubs));
			const sanitizedPlateClubs = sanitizeClubImages(loadedPlateClubs, imageByUuid);
			if (sanitizedPlateClubs.changed) {
				safeSetItem('plateClubs', JSON.stringify(sanitizedPlateClubs.clubs));
			}

			const loadedSeasons = (action.payload as TSeason[]).map(season => ({
				...season,
				league: season.league ?? 'PRIMERA',
			}));
			const sanitizedSeasons = sanitizeSeasonImages(loadedSeasons, imageByUuid);
			if (sanitizedSeasons.changed) {
				safeSetItem('seasons', JSON.stringify(sanitizedSeasons.seasons));
			}

			const sanitizedWorldCups = sanitizeWorldCupImages(loadWorldCups(), imageByUuid);
			if (sanitizedWorldCups.changed) {
				safeSetItem('worldCups', JSON.stringify(sanitizedWorldCups.worldCups));
			}

			return {
				...state,
				clubs: sanitizedClubs.clubs,
				plateClubs: sanitizedPlateClubs.clubs,
				intlClubs: loadIntlClubs(),
				seasons: sanitizedSeasons.seasons,
				worldCups: sanitizedWorldCups.worldCups,
			};
		}
		case '[SEASSON] - NEW SEASSON': {
			// A World Cup is played between cycles: no new season until it's over.
			if (
				getCurrentWorldCup(state.worldCups) ||
				getUnplayedWorldCupCycle(state.seasons, state.worldCups) !== undefined
			) {
				return state;
			}
			const requestedUuid = action.payload as string;
			const myLeague: TLeague = state.plateClubs.some(club => club.uuid === state.myClub?.uuid)
				? 'PLATE'
				: 'PRIMERA';
			const pairId = getUuid();
			// International leagues only exist from the first season created with
			// this feature, so they define the World Cup cycle numbering.
			const intlNumber = state.seasons.filter(s => s.league === INTL_LEAGUES[0]).length + 1;
			const wcCycle = Math.ceil(intlNumber / SEASONS_PER_WORLD_CUP);
			const wcCycleSeason = ((intlNumber - 1) % SEASONS_PER_WORLD_CUP) + 1;

			const buildSeason = (league: TLeague, clubsForLeague: IClub[]): TSeason => ({
				uuid: league === myLeague ? requestedUuid : getUuid(),
				number: state.seasons.filter(s => s.league === league).length + 1,
				league,
				pairId,
				wcCycle,
				wcCycleSeason,
				isCurrent: true,
				fase: {
					regular: {
						status: 'ACTIVE',
						matches: {
							uuid: getUuid(),
							title: 'Regular',
							matches: getJourneys(clubsForLeague),
						},
						currentJourney: 1,
					},
					semifinal: {
						status: 'BLOCKED',
						currentJourney: 1,
						winners: [],
						matches: {
							uuid: getUuid(),
							title: 'Semifinal',
							matches: [],
						},
					},
					final: {
						status: 'BLOCKED',
						currentJourney: 1,
						matches: {
							uuid: getUuid(),
							title: 'final',
							matches: [],
						},
					},
				},
				table: clubsForLeague.map(
					club =>
						({
							club: { ...club },
							ga: 0,
							gd: 0,
							gf: 0,
							md: 0,
							mg: 0,
							ml: 0,
							mw: 0,
							pts: 0,
						}) as IItemTable,
				),
				winner: null,
			});

			const newSeasons = [
				buildSeason('PRIMERA', state.clubs),
				buildSeason('PLATE', state.plateClubs),
				...INTL_LEAGUES.map(league => buildSeason(league, state.intlClubs[league])),
			];

			const oldSeassons = state.seasons.map(seasson => ({
				...seasson,
				isCurrent: false,
			}));
			const seasons = [...oldSeassons, ...newSeasons];
			safeSetItem('seasons', JSON.stringify(seasons));
			return { ...state, seasons };
		}
		case '[SEASSON-REGULAR] - ADD MATCH SCORE': {
			const { uuid, matches } = action.payload as { uuid: string; matches: TJourney };
			const season = state.seasons.find(s => s.uuid === uuid) as TSeason;
			const seasonUpdated = applyRegularJourney(season, matches, state.myClub as IClub);
			const updates: TSeason[] = [seasonUpdated];

			for (const pair of getPairSeasons(season, state.seasons)) {
				updates.push(syncShadowFase('regular', seasonUpdated, pair));
			}

			return {
				...state,
				seasons: setSeasonsBatch(updates, state.seasons),
			};
		}
		case '[SEASSON] - UPDATED STATUS FASE': {
			const { sid, type, status } = action.payload as TBlockedFase;

			const season = state.seasons.find(season => season.uuid === sid) as TSeason;

			const applyStatus = (target: TSeason): TSeason => ({
				...target,
				fase: { ...target.fase, [type]: { ...target.fase[type], status } },
			});

			let rosters = pickRosters(state);

			const applyTrophy = (target: TSeason) => {
				if (status !== 'BLOCKED') return;
				if (type === 'regular') {
					rosters = bumpTrophy(rosters, target.league, target.table[0]?.club.uuid, 'champions');
				} else if (type === 'final') {
					const winnerUuid = target.fase.final?.winners && target.fase.final.winners[0]?.uuid;
					rosters = bumpTrophy(rosters, target.league, winnerUuid, 'supercups');
				}
			};

			const updatedSeason = applyStatus(season);
			applyTrophy(season);
			const updates: TSeason[] = [updatedSeason];

			for (const pair of getPairSeasons(season, state.seasons)) {
				if (status !== 'BLOCKED' || pair.fase[type].status === 'BLOCKED') continue;
				// Belt-and-suspenders: make sure the shadow season's own copy of
				// this phase is fully simulated before locking it, in case the
				// incremental mirroring never got a trigger (e.g. myClub was the
				// only match left, so no "Simulate" click ever fired for it).
				const pairSynced = syncShadowFase(type, updatedSeason, pair);
				updates.push(applyStatus(pairSynced));
				applyTrophy(pairSynced);
			}

			persistRosters(rosters, state);

			return {
				...state,
				...rosters,
				seasons: setSeasonsBatch(updates, state.seasons),
			};
		}
		case '[SEASSON-SEMIFINALS] - SET MATCHES': {
			const sid = action.payload;
			const season = state.seasons.find(season => season.uuid === sid) as TSeason;
			const updatedSeason = buildSemifinalSeason(season);
			const updates: TSeason[] = [updatedSeason];

			for (const pair of getPairSeasons(season, state.seasons)) {
				if (pair.fase.semifinal.status === 'BLOCKED') updates.push(buildSemifinalSeason(pair));
			}

			return {
				...state,
				seasons: setSeasonsBatch(updates, state.seasons),
			};
		}
		case '[SEASSON-SEMIFINALS] - ADD MATCH SCORE': {
			const { uuid, matches } = action.payload as { uuid: string; matches: TJourney };
			const result = updateMatchesNoDraw({
				type: 'semifinal',
				uuid,
				matches,
				seasons: state.seasons,
				myClub: state.myClub as IClub,
			});
			const seasonUpdated = applyKnockoutResult('semifinal', result);
			const updates: TSeason[] = [seasonUpdated];

			for (const pair of getPairSeasons(result.season, state.seasons)) {
				updates.push(syncShadowFase('semifinal', seasonUpdated, pair));
			}

			return {
				...state,
				seasons: setSeasonsBatch(updates, state.seasons),
			};
		}
		case '[SEASSON-FINAL] - SET MATCHES': {
			const sid = action.payload;
			const season = state.seasons.find(season => season.uuid === sid) as TSeason;
			const updatedSeason = buildFinalSeason(season);
			const updates: TSeason[] = [updatedSeason];

			for (const pair of getPairSeasons(season, state.seasons)) {
				if (pair.fase.final.status === 'BLOCKED') updates.push(buildFinalSeason(pair));
			}

			return {
				...state,
				seasons: setSeasonsBatch(updates, state.seasons),
			};
		}
		case '[SEASSON-FINAL] - ADD MATCH SCORE': {
			const { uuid, matches } = action.payload as { uuid: string; matches: TJourney };
			const result = updateMatchesNoDraw({
				type: 'final',
				uuid,
				matches,
				seasons: state.seasons,
				myClub: state.myClub as IClub,
			});
			const seasonUpdated = applyKnockoutResult('final', result);
			const updates: TSeason[] = [seasonUpdated];

			for (const pair of getPairSeasons(result.season, state.seasons)) {
				updates.push(syncShadowFase('final', seasonUpdated, pair));
			}

			return {
				...state,
				seasons: setSeasonsBatch(updates, state.seasons),
			};
		}
		case '[SEASSON] - FINISHED SEASON': {
			const { sid } = action.payload as { sid: string; winner: IClub };
			const season = state.seasons.find(s => s.uuid === sid) as TSeason;
			let updates: TSeason[] = [finishSeason(season)];
			for (const pair of getPairSeasons(season, state.seasons)) {
				if (pair.isCurrent) updates.push(finishSeason(pair));
			}

			let rosters = pickRosters(state);

			const primera = updates.find(s => s.league === 'PRIMERA');
			const plate = updates.find(s => s.league === 'PLATE');
			if (primera && plate && primera.number % 2 === 0) {
				const swap = checkPromotionRelegation(
					primera.number,
					state.seasons,
					state.clubs,
					state.plateClubs,
				);
				rosters = { ...rosters, clubs: swap.clubs, plateClubs: swap.plateClubs };
				if (swap.promoted && swap.relegated) {
					const promotion = { promoted: swap.promoted, relegated: swap.relegated };
					updates = updates.map(s =>
						s.league === 'PRIMERA' || s.league === 'PLATE' ? { ...s, promotion } : s,
					);
				}
			}
			persistRosters(rosters, state);

			const seasons = setSeasonsBatch(updates, state.seasons);

			// Last season of a World Cup cycle: qualify the top 4 of each league.
			let worldCups = state.worldCups;
			const cycle = season.wcCycle;
			if (
				cycle &&
				season.wcCycleSeason === SEASONS_PER_WORLD_CUP &&
				!worldCups.some(wc => wc.cycle === cycle)
			) {
				worldCups = [
					...worldCups.map(wc => ({ ...wc, isCurrent: false })),
					createWorldCup(seasons, cycle, worldCups.length + 1),
				];
				safeSetItem('worldCups', JSON.stringify(worldCups));
			}

			return { ...state, ...rosters, seasons, worldCups };
		}
		case '[SEASSON] - ADDED MY SCORE': {
			const { match: myMatch, sid, jid, type } = action.payload as TAddMyScore;
			const season = state.seasons.find(s => s.uuid === sid) as TSeason;
			const fase = season.fase[type];
			const journey = fase.matches.matches.find(journey => journey.jid === jid);
			const matches = journey?.value.map(match => (match.uuid === myMatch.uuid ? myMatch : match));
			const matchesDone: TMatches[] | undefined = matches?.map(match =>
				match.uuid === myMatch.uuid ? { ...myMatch, status: 'DONE' } : match,
			);
			const isDone = !matchesDone?.some(match => match.status === 'TODO');

			const newTable =
				type === 'regular'
					? orderMyTeam(state.myClub as IClub, season.table, {
						...journey,
						value: matches,
					} as TJourney)
					: season.table;
			const journeys = fase.matches.matches.map(journey =>
				journey.jid === jid
					? {
						...journey,
						status: isDone ? 'DONE' : 'TODO',
						value: matchesDone,
					}
					: journey,
			);
			let winners;
			if (type === 'semifinal' || type === 'final') {
				if (isDone && matchesDone) {
					winners = matchesDone.map(match => getWinner(match).winner);
				}
			}
			const seasonUpdated: TSeason = {
				...season,
				table: [...newTable],
				fase: {
					...season.fase,

					[type]: {
						...fase,
						...((type === 'semifinal' || type === 'final') && {
							winners,
						}),
						status: journeys.some(item => item.status === 'TODO') ? 'ACTIVE' : 'FINISHED',
						currentJourney: isDone ? fase.currentJourney + 1 : fase.currentJourney,
						matches: {
							...fase.matches,
							matches: journeys,
						},
					} as TFase,
				},
			};
			const updates: TSeason[] = [seasonUpdated];

			// myClub's own match can be the only one left in a journey (e.g. a
			// final where myClub is one of the two finalists, so there is no
			// "other" match to trigger the Simulate mirroring above) — make sure
			// the shadow seasons still catch up here too.
			for (const pair of getPairSeasons(season, state.seasons)) {
				updates.push(syncShadowFase(type, seasonUpdated, pair));
			}

			return {
				...state,
				seasons: setSeasonsBatch(updates, state.seasons),
			};
		}
		default:
			return worldCupReducer(state, action) ?? state;
	}
};

function getScoreNoDraw(matches: TJourney, myClub: IClub) {
	const matchesDone = matches.value.map(match => {
		if (!isMyClub(match, myClub)) {
			let matchWithScore: TMatches;
			do {
				matchWithScore = getRandomScore(match);
			} while (matchWithScore.local.score === matchWithScore.visit.score);

			return matchWithScore;
		}
		return match;
	});

	return matchesDone;
}
type TParams = {
	type: 'regular' | 'semifinal' | 'final';
	uuid: string;
	matches: TJourney;
	seasons: TSeason[];
	myClub: IClub;
};

function updateMatchesNoDraw({ type, uuid, matches, seasons, myClub }: TParams) {
	const season = seasons.find(s => s.uuid === uuid) as TSeason;
	const matchesDone = getScoreNoDraw(matches, myClub);
	const matchesWithScore: TJourney = {
		jid: matches.jid,
		status: matchesDone.some(match => match.status === 'TODO') ? 'TODO' : 'DONE',
		value: matchesDone,
	};
	const currentJourney = season.fase[type].currentJourney;
	const updatedJourneys = season.fase[type].matches.matches.map(jry => {
		return jry.jid === matchesWithScore.jid ? matchesWithScore : jry;
	});
	const isFinished = !updatedJourneys.some(jourey => jourey.status === 'TODO');
	const winners = matchesWithScore.value.map(match => getWinner(match).winner);

	return {
		season,
		isFinished,
		currentJourney,
		winners,
		matches: updatedJourneys,
	};
}

type TKnockoutResult = ReturnType<typeof updateMatchesNoDraw>;

function applyKnockoutResult(type: 'semifinal' | 'final', result: TKnockoutResult): TSeason {
	const { season, isFinished, currentJourney, winners, matches } = result;
	return {
		...season,
		fase: {
			...season.fase,
			[type]: {
				...season.fase[type],
				currentJourney: isFinished ? currentJourney + 1 : currentJourney,
				status: !isFinished ? 'ACTIVE' : 'FINISHED',
				winners,
				matches: {
					...season.fase[type].matches,
					matches,
				},
			} as TFase & { winners?: ITeamMatch[] },
		},
	};
}
