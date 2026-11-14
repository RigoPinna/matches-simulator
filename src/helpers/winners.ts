import { IClub, ITeamMatch, TSeason, TState, TWorldCup } from '../store';
import { INTL_LEAGUES, TIntlLeague, TLeague } from '../store/Seasson/leagues';
import { getWinner } from './getWinner';

export type TWinnersTab = TLeague | 'WORLD_CUP';
export type TTrophyKey = 'champions' | 'supercups' | 'plateChampions' | 'plateSupercups' | 'worldCups';
export type TTrophyKind = 'LEAGUE' | 'SUPERCUP' | 'WORLD_CUP';

/**
 * Which club counters hold each tab's trophies, in ranking priority. League
 * tabs also show the World Cups each club has won (global, any league).
 */
export const TAB_TROPHIES: Record<TWinnersTab, { key: TTrophyKey; kind: TTrophyKind; label: string }[]> = {
	PRIMERA: [
		{ key: 'champions', kind: 'LEAGUE', label: 'League' },
		{ key: 'supercups', kind: 'SUPERCUP', label: 'Supercup' },
		{ key: 'worldCups', kind: 'WORLD_CUP', label: 'World Cup' },
	],
	PLATE: [
		{ key: 'plateChampions', kind: 'LEAGUE', label: 'League' },
		{ key: 'plateSupercups', kind: 'SUPERCUP', label: 'Supercup' },
		{ key: 'worldCups', kind: 'WORLD_CUP', label: 'World Cup' },
	],
	ESP_ENG: [
		{ key: 'champions', kind: 'LEAGUE', label: 'League' },
		{ key: 'supercups', kind: 'SUPERCUP', label: 'Supercup' },
		{ key: 'worldCups', kind: 'WORLD_CUP', label: 'World Cup' },
	],
	BRA_ARG: [
		{ key: 'champions', kind: 'LEAGUE', label: 'League' },
		{ key: 'supercups', kind: 'SUPERCUP', label: 'Supercup' },
		{ key: 'worldCups', kind: 'WORLD_CUP', label: 'World Cup' },
	],
	GER_USA: [
		{ key: 'champions', kind: 'LEAGUE', label: 'League' },
		{ key: 'supercups', kind: 'SUPERCUP', label: 'Supercup' },
		{ key: 'worldCups', kind: 'WORLD_CUP', label: 'World Cup' },
	],
	WORLD_CUP: [{ key: 'worldCups', kind: 'WORLD_CUP', label: 'World Cup' }],
};

const isIntl = (tab: TWinnersTab): tab is TIntlLeague => (INTL_LEAGUES as readonly string[]).includes(tab);

/**
 * Clubs whose counters belong to a tab. Primera / Plate look at both
 * rosters, so a champion that later changed division still shows up.
 */
export const getTabClubs = (
	tab: TWinnersTab,
	{ clubs, plateClubs, intlClubs }: Pick<TState, 'clubs' | 'plateClubs' | 'intlClubs'>,
): IClub[] => {
	if (isIntl(tab)) return intlClubs[tab];
	if (tab === 'WORLD_CUP') return [...clubs, ...plateClubs, ...Object.values(intlClubs).flat()];
	return [...clubs, ...plateClubs];
};

export type TRankingRow = { club: IClub; counts: number[]; position: number };

/** Clubs with at least one trophy, best first; equal counts share a position. */
export const getTrophyRanking = (tab: TWinnersTab, clubs: IClub[]): TRankingRow[] => {
	const keys = TAB_TROPHIES[tab].map(t => t.key);
	const rows = clubs
		.map(club => ({ club, counts: keys.map(key => club[key] || 0) }))
		.filter(row => row.counts.some(count => count > 0))
		.sort((a, b) => {
			for (let i = 0; i < keys.length; i++) {
				if (a.counts[i] !== b.counts[i]) return b.counts[i] - a.counts[i];
			}
			return a.club.name.localeCompare(b.club.name);
		});
	// Standard competition ranking: 1, 2, 2, 4...
	let position = 0;
	return rows.map((row, i) => {
		const prev = rows[i - 1];
		const tied = prev && prev.counts.every((count, k) => count === row.counts[k]);
		if (!tied) position = i + 1;
		return { ...row, position };
	});
};

export type THistoryEntry = {
	id: string;
	title: string;
	/** League winner (or World Cup champion). */
	first: ITeamMatch;
	/** Supercup winner (or World Cup runner-up). */
	second?: ITeamMatch;
	/** Same club won both league and supercup. */
	double: boolean;
	worldCupId?: string;
};

/** Finished competitions of a tab, newest first. */
export const getTitleHistory = (
	tab: TWinnersTab,
	seasons: TSeason[],
	worldCups: TWorldCup[],
): THistoryEntry[] => {
	if (tab === 'WORLD_CUP') {
		return worldCups
			.filter(wc => wc.champion)
			.sort((a, b) => b.number - a.number)
			.map(wc => ({
				id: wc.uuid,
				title: `World Cup ${wc.number}`,
				first: wc.champion as ITeamMatch,
				second: wc.final[0] ? getWinner(wc.final[0]).loser : undefined,
				double: false,
				worldCupId: wc.uuid,
			}));
	}
	return seasons
		.filter(season => season.league === tab && season.winner)
		.sort((a, b) => b.number - a.number)
		.map(season => {
			// Old saves store a single winner object instead of [league, supercup].
			const winner = season.winner as ITeamMatch[] | ITeamMatch;
			const [first, second] = Array.isArray(winner) ? winner : [winner, undefined];
			return {
				id: season.uuid,
				title: `Season ${season.number}`,
				first,
				second,
				double: !!second && first.uuid === second.uuid,
			};
		});
};
