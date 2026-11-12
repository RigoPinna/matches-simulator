import { v4 as getUuid } from 'uuid';
import {
	IClub,
	IItemTable,
	ITeamMatch,
	TGroupDrawStep,
	TGroupName,
	TJourney,
	TMatches,
	TSeason,
	TWorldCup,
	TWorldCupGroup,
	TWorldCupQualifier,
} from '../store';
import {
	INTL_LEAGUES,
	QUALIFIERS_PER_LEAGUE,
	SEASONS_PER_WORLD_CUP,
	WORLD_CUP_LEAGUES,
} from '../store/Seasson/leagues';
import { aggregateWorldCupTable } from './aggregateTable';
import { getRandomScore } from './getRandomScore';
import { getWinner } from './getWinner';

export const GROUP_NAMES: TGroupName[] = ['A', 'B', 'C', 'D'];

const shuffle = <T>(items: T[]): T[] => {
	const copy = [...items];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
};

/** Lightweight club copy for matches/tables (no trophy counters). */
const toSnapshot = ({ uuid, name, image, color }: IClub): IClub => ({ uuid, name, image, color });
const toTeam = (club: IClub): ITeamMatch => ({ ...toSnapshot(club), score: null });

const emptyRow = (club: IClub): IItemTable => ({
	club: toSnapshot(club),
	mg: 0,
	mw: 0,
	md: 0,
	ml: 0,
	pts: 0,
	gf: 0,
	ga: 0,
	gd: 0,
});

const newMatch = (local: IClub, visit: IClub): TMatches => ({
	uuid: getUuid(),
	status: 'TODO',
	local: toTeam(local),
	visit: toTeam(visit),
});

/** Top 4 of each World Cup league over the given cycle. */
export const getWorldCupQualifiers = (seasons: TSeason[], cycle: number): TWorldCupQualifier[] =>
	WORLD_CUP_LEAGUES.flatMap(league =>
		aggregateWorldCupTable(seasons, league, cycle)
			.slice(0, QUALIFIERS_PER_LEAGUE)
			.map((row, index) => ({
				club: toSnapshot(row.club),
				league,
				position: index + 1,
				pts: row.pts,
			})),
	);

export const createWorldCup = (seasons: TSeason[], cycle: number, number: number): TWorldCup => ({
	uuid: getUuid(),
	number,
	cycle,
	isCurrent: true,
	stage: 'GROUP_DRAW',
	qualifiers: getWorldCupQualifiers(seasons, cycle),
	groups: [],
	groupDraw: [],
	groupJourney: 0,
	quarterfinals: [],
	semifinals: [],
	final: [],
	champion: null,
});

/**
 * Pot p holds every league's p-th place. Each group gets exactly one club
 * per pot AND one club per league, so two clubs from the same league never
 * share a group. That is a random 4x4 Latin square: pot by pot, pick a
 * random league→group permutation that doesn't reuse a group a league
 * already has (a Latin rectangle can always be completed, so retrying
 * terminates quickly).
 */
const drawGroupAssignment = (leagues: string[]): Record<string, TGroupName>[] => {
	const potCount = QUALIFIERS_PER_LEAGUE;
	for (;;) {
		const pots: Record<string, TGroupName>[] = [];
		const used = new Map(leagues.map(league => [league, new Set<TGroupName>()]));
		let failed = false;
		for (let pot = 0; pot < potCount && !failed; pot++) {
			let assignment: Record<string, TGroupName> | undefined;
			for (let attempt = 0; attempt < 200 && !assignment; attempt++) {
				const groups = shuffle(GROUP_NAMES);
				if (leagues.every((league, i) => !used.get(league)!.has(groups[i]))) {
					assignment = Object.fromEntries(leagues.map((league, i) => [league, groups[i]]));
				}
			}
			if (!assignment) {
				failed = true;
				break;
			}
			for (const league of leagues) used.get(league)!.add(assignment[league]);
			pots.push(assignment);
		}
		if (!failed) return pots;
	}
};

/** Single round robin: 3 matchdays, 2 matches each. Index 0 is the pot 1 club. */
const ROUND_ROBIN_4: [number, number][][] = [
	[
		[0, 3],
		[1, 2],
	],
	[
		[0, 2],
		[3, 1],
	],
	[
		[0, 1],
		[2, 3],
	],
];

export const drawGroups = (
	qualifiers: TWorldCupQualifier[],
): { groups: TWorldCupGroup[]; groupDraw: TGroupDrawStep[] } => {
	const leagues = [...new Set(qualifiers.map(q => q.league))];
	const assignment = drawGroupAssignment(leagues);

	const groupDraw: TGroupDrawStep[] = [];
	const members = new Map<TGroupName, IClub[]>(GROUP_NAMES.map(name => [name, []]));
	for (let pot = 1; pot <= QUALIFIERS_PER_LEAGUE; pot++) {
		const potClubs = shuffle(qualifiers.filter(q => q.position === pot));
		for (const qualifier of potClubs) {
			const group = assignment[pot - 1][qualifier.league];
			members.get(group)!.push(qualifier.club);
			groupDraw.push({ clubUuid: qualifier.club.uuid, group, pot });
		}
	}

	const groups = GROUP_NAMES.map(name => {
		const clubs = members.get(name)!;
		const journeys: TJourney[] = ROUND_ROBIN_4.map(pairs => ({
			jid: getUuid(),
			status: 'TODO',
			value: pairs.map(([l, v]) => newMatch(clubs[l], clubs[v])),
		}));
		return { name, table: clubs.map(emptyRow), journeys };
	});

	return { groups, groupDraw };
};

export type TGroupStanding = { group: TGroupName; first: IClub; second: IClub };

export const getGroupStandings = (groups: TWorldCupGroup[]): TGroupStanding[] =>
	groups.map(group => ({
		group: group.name,
		first: group.table[0].club,
		second: group.table[1].club,
	}));

/**
 * Group winners play a runner-up from a DIFFERENT group; the group winner
 * is the local side. The match order is shuffled too, and that order is the
 * bracket: QF1/QF2 feed SF1, QF3/QF4 feed SF2.
 */
export const drawQuarterfinals = (groups: TWorldCupGroup[]): TMatches[] => {
	const standings = getGroupStandings(groups);
	let runners: TGroupStanding[];
	do {
		runners = shuffle(standings);
	} while (runners.some((runner, i) => runner.group === standings[i].group));
	const matches = standings.map((winner, i) => newMatch(winner.first, runners[i].second));
	return shuffle(matches);
};

export const buildNextRound = (matches: TMatches[]): TMatches[] => {
	const winners = matches.map(match => getWinner(match).winner);
	const next: TMatches[] = [];
	for (let i = 0; i < winners.length; i += 2) {
		next.push(newMatch(winners[i], winners[i + 1]));
	}
	return next;
};

/**
 * Random score. Knockout matches can't end in a draw (no penalties): the
 * score is re-rolled until one club wins.
 */
export const simulateMatch = (match: TMatches, knockout: boolean): TMatches => {
	let result = getRandomScore(match);
	while (knockout && result.local.score === result.visit.score) {
		result = getRandomScore(match);
	}
	return result;
};

/**
 * A cycle whose last season already exists but has no World Cup yet. While
 * there is one, no new season can be created (the World Cup is created when
 * that last season finishes).
 */
export const getUnplayedWorldCupCycle = (
	seasons: TSeason[],
	worldCups: TWorldCup[],
): number | undefined =>
	seasons
		.filter(s => s.league === INTL_LEAGUES[0] && s.wcCycleSeason === SEASONS_PER_WORLD_CUP)
		.map(s => s.wcCycle as number)
		.find(cycle => !worldCups.some(wc => wc.cycle === cycle));
