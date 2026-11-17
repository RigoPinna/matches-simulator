import { ITeamMatch, TSeason, TWorldCup } from '../store';
import { LEAGUE_INFO, TLeague } from '../store/Seasson/leagues';
import { getLastWorldCupChampion } from './worldCup';

type TLeagueChampions = { leagues: Map<string, TLeague>; supercups: Map<string, TLeague> };

/**
 * League champion (table winner) and supercup champion (final winner) of the
 * latest finished season of each league.
 */
export const getLastLeagueChampions = (seasons: TSeason[]): TLeagueChampions => {
	const latest = new Map<TLeague, TSeason>();
	for (const season of seasons) {
		if (!season.winner) continue;
		const prev = latest.get(season.league);
		if (!prev || season.number > prev.number) latest.set(season.league, season);
	}
	const leagues = new Map<string, TLeague>();
	const supercups = new Map<string, TLeague>();
	for (const [league, season] of latest) {
		// Old saves store a single winner object instead of [league, supercup].
		const winner = season.winner as ITeamMatch[] | ITeamMatch;
		const [champion, supercup] = Array.isArray(winner) ? winner : [winner, undefined];
		if (champion) leagues.set(champion.uuid, league);
		if (supercup) supercups.set(supercup.uuid, league);
	}
	return { leagues, supercups };
};

export type TChampionKind = 'WORLD_CUP' | 'LEAGUE' | 'SUPERCUP';
export type TChampionTitle = { kind: TChampionKind; label: string; league?: TLeague };

export type TChampions = TLeagueChampions & { worldCup?: string };

export const getChampions = (seasons: TSeason[], worldCups: TWorldCup[]): TChampions => ({
	worldCup: getLastWorldCupChampion(worldCups)?.uuid,
	...getLastLeagueChampions(seasons),
});

/** Current titles held by a club, most important first: World Cup, league, supercup. */
export const getChampionTitles = (uuid: string, champions: TChampions): TChampionTitle[] => {
	const titles: TChampionTitle[] = [];
	if (champions.worldCup === uuid) titles.push({ kind: 'WORLD_CUP', label: 'World Cup champion' });
	const league = champions.leagues.get(uuid);
	if (league) titles.push({ kind: 'LEAGUE', league, label: `${LEAGUE_INFO[league].name} champion` });
	const supercup = champions.supercups.get(uuid);
	if (supercup) {
		titles.push({ kind: 'SUPERCUP', league: supercup, label: `${LEAGUE_INFO[supercup].name} supercup champion` });
	}
	return titles;
};
