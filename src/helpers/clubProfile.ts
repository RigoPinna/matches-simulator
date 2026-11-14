import { ITeamMatch, TMatches, TSeason, TWorldCup } from '../store';
import { LEAGUE_INFO, TLeague } from '../store/Seasson/leagues';
import { TClubMatch, TMatchKind, TMatchResult } from './getClubMatches';

/* ---------------------------------------------------------------- stats */

export type TRecord = { played: number; wins: number; draws: number; losses: number };
export type TClubStats = TRecord & {
	goalsFor: number;
	goalsAgainst: number;
	winPercentage: number;
	/** Current run of identical results, newest first. */
	streak?: { result: TMatchResult; count: number };
	biggestWin?: TClubMatch;
	biggestLoss?: TClubMatch;
	byKind: Record<TMatchKind, TRecord>;
};

const emptyRecord = (): TRecord => ({ played: 0, wins: 0, draws: 0, losses: 0 });
const addResult = (record: TRecord, result: TMatchResult) => {
	record.played++;
	if (result === 'WIN') record.wins++;
	else if (result === 'DRAW') record.draws++;
	else record.losses++;
};

/** Goals of the club / of the opponent in a match. */
export const getGoals = (m: TClubMatch) => {
	const own = (m.isHome ? m.match.local.score : m.match.visit.score) ?? 0;
	const other = (m.isHome ? m.match.visit.score : m.match.local.score) ?? 0;
	return { own, other };
};

/** Aggregated numbers for a list of matches (newest first, as getClubMatches returns). */
export const getClubStats = (matches: TClubMatch[]): TClubStats => {
	const total = emptyRecord();
	const byKind: Record<TMatchKind, TRecord> = {
		LEAGUE: emptyRecord(),
		SUPERCUP: emptyRecord(),
		WORLD_CUP: emptyRecord(),
	};
	let goalsFor = 0;
	let goalsAgainst = 0;
	let biggestWin: TClubMatch | undefined;
	let biggestLoss: TClubMatch | undefined;
	const margin = (m: TClubMatch) => getGoals(m).own - getGoals(m).other;

	for (const m of matches) {
		addResult(total, m.result);
		addResult(byKind[m.kind], m.result);
		const { own, other } = getGoals(m);
		goalsFor += own;
		goalsAgainst += other;
		// Ties on margin keep the most recent one (the list is newest first).
		if (m.result === 'WIN' && (!biggestWin || margin(m) > margin(biggestWin))) biggestWin = m;
		if (m.result === 'LOSS' && (!biggestLoss || margin(m) < margin(biggestLoss))) biggestLoss = m;
	}

	let streak: TClubStats['streak'];
	if (matches.length) {
		let count = 0;
		while (count < matches.length && matches[count].result === matches[0].result) count++;
		streak = { result: matches[0].result, count };
	}

	return {
		...total,
		goalsFor,
		goalsAgainst,
		winPercentage: total.played ? (total.wins / total.played) * 100 : 0,
		streak,
		biggestWin,
		biggestLoss,
		byKind,
	};
};

/* -------------------------------------------------------- season history */

export type TSeasonRow = {
	uuid: string;
	league: TLeague;
	number: number;
	isCurrent: boolean;
	position: number;
	teams: number;
	pts: number;
	played: number;
	wonLeague: boolean;
	wonSupercup: boolean;
	movement?: 'PROMOTED' | 'RELEGATED';
};

/** One row per season the club played, newest first. */
export const getClubSeasonHistory = (cid: string, seasons: TSeason[]): TSeasonRow[] =>
	seasons
		.filter(season => season.table.some(row => row.club.uuid === cid))
		.map(season => {
			const index = season.table.findIndex(row => row.club.uuid === cid);
			// Old saves store a single winner object instead of [league, supercup].
			const winner = season.winner as ITeamMatch[] | ITeamMatch | null;
			const [league, supercup] = Array.isArray(winner) ? winner : [winner, undefined];
			return {
				uuid: season.uuid,
				league: season.league,
				number: season.number,
				isCurrent: season.isCurrent,
				position: index + 1,
				teams: season.table.length,
				pts: season.table[index].pts,
				played: season.table[index].mg,
				wonLeague: league?.uuid === cid,
				wonSupercup: supercup?.uuid === cid,
				movement:
					season.promotion?.promoted.uuid === cid
						? ('PROMOTED' as const)
						: season.promotion?.relegated.uuid === cid
							? ('RELEGATED' as const)
							: undefined,
			};
		})
		.reverse();

export const getSeasonLabel = (row: Pick<TSeasonRow, 'league' | 'number'>) =>
	row.league === 'PRIMERA' ? `Season ${row.number}` : `${LEAGUE_INFO[row.league].short} ${row.number}`;

/* ------------------------------------------------------------ next match */

export type TNextMatch = { opponent: ITeamMatch; isHome: boolean; competition: string; stage: string };

const findPending = (matches: TMatches[], cid: string) =>
	matches.find(m => m.status === 'TODO' && (m.local.uuid === cid || m.visit.uuid === cid));

const toNext = (match: TMatches, cid: string, competition: string, stage: string): TNextMatch => ({
	opponent: match.local.uuid === cid ? match.visit : match.local,
	isHome: match.local.uuid === cid,
	competition,
	stage,
});

/** The club's next pending match in the season or World Cup being played. */
export const getNextMatch = (
	cid: string,
	seasons: TSeason[],
	worldCups: TWorldCup[],
): TNextMatch | undefined => {
	const wc = worldCups.find(w => w.isCurrent);
	if (wc) {
		const competition = `World Cup ${wc.number}`;
		if (wc.stage === 'GROUPS') {
			for (const group of wc.groups) {
				const match = findPending(group.journeys[wc.groupJourney]?.value ?? [], cid);
				if (match) return toNext(match, cid, competition, `Group ${group.name}`);
			}
		}
		const round = { QUARTERS: wc.quarterfinals, SEMIS: wc.semifinals, FINAL: wc.final }[
			wc.stage as 'QUARTERS' | 'SEMIS' | 'FINAL'
		];
		const match = round && findPending(round, cid);
		if (match) {
			const stage = { QUARTERS: 'Quarterfinal', SEMIS: 'Semifinal', FINAL: 'Final' }[
				wc.stage as 'QUARTERS' | 'SEMIS' | 'FINAL'
			];
			return toNext(match, cid, competition, stage);
		}
	}
	const season = seasons.find(s => s.isCurrent && s.table.some(row => row.club.uuid === cid));
	if (!season) return undefined;
	const competition = getSeasonLabel(season);
	const phases = [
		{ fase: season.fase.regular, stage: (i: number) => `Journey ${i + 1}` },
		{ fase: season.fase.semifinal, stage: () => 'Semifinal' },
		{ fase: season.fase.final, stage: () => 'Final' },
	];
	for (const { fase, stage } of phases) {
		if (fase.status !== 'ACTIVE') continue;
		// First journey where the club still has to play (its match in the
		// current journey may already be done while others are pending).
		for (let i = 0; i < fase.matches.matches.length; i++) {
			const match = findPending(fase.matches.matches[i].value, cid);
			if (match) return toNext(match, cid, competition, stage(i));
		}
	}
	return undefined;
};

/** 1 → "1st", 2 → "2nd", 11 → "11th"... */
export const ordinal = (n: number) => {
	const suffix = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th';
	return `${n}${suffix}`;
};
