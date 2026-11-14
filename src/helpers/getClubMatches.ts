import { IClub, ITeamMatch, TMatches, TSeason, TWorldCup } from '../store';
import { LEAGUE_INFO } from '../store/Seasson/leagues';

export type TMatchKind = 'LEAGUE' | 'SUPERCUP' | 'WORLD_CUP';
export type TMatchResult = 'WIN' | 'DRAW' | 'LOSS';

export type TClubMatch = {
	match: TMatches;
	kind: TMatchKind;
	/** Competition, e.g. "Season 3", "GER/USA 2", "World Cup 1". */
	competition: string;
	/** Round inside the competition, e.g. "Journey 5", "Semifinal", "Group B". */
	stage: string;
	result: TMatchResult;
	opponent: ITeamMatch;
	isHome: boolean;
};

const isPlayed = (match: TMatches) =>
	match.status === 'DONE' &&
	typeof match.local.score === 'number' &&
	typeof match.visit.score === 'number';

const toClubMatch = (
	match: TMatches,
	cid: string,
	kind: TMatchKind,
	competition: string,
	stage: string,
): TClubMatch | null => {
	if (!isPlayed(match)) return null;
	const isHome = match.local.uuid === cid;
	if (!isHome && match.visit.uuid !== cid) return null;
	const own = (isHome ? match.local.score : match.visit.score) as number;
	const other = (isHome ? match.visit.score : match.local.score) as number;
	return {
		match,
		kind,
		competition,
		stage,
		result: own > other ? 'WIN' : own < other ? 'LOSS' : 'DRAW',
		opponent: isHome ? match.visit : match.local,
		isHome,
	};
};

const seasonMatches = (season: TSeason, cid: string): TClubMatch[] => {
	const competition =
		season.league === 'PRIMERA'
			? `Season ${season.number}`
			: `${LEAGUE_INFO[season.league].short} ${season.number}`;
	const out: (TClubMatch | null)[] = [];
	season.fase.regular.matches.matches.forEach((journey, i) =>
		journey.value.forEach(m => out.push(toClubMatch(m, cid, 'LEAGUE', competition, `Journey ${i + 1}`))),
	);
	season.fase.semifinal.matches.matches.forEach(journey =>
		journey.value.forEach(m => out.push(toClubMatch(m, cid, 'SUPERCUP', competition, 'Semifinal'))),
	);
	season.fase.final.matches.matches.forEach(journey =>
		journey.value.forEach(m => out.push(toClubMatch(m, cid, 'SUPERCUP', competition, 'Final'))),
	);
	return out.filter((m): m is TClubMatch => m !== null);
};

const worldCupMatches = (wc: TWorldCup, cid: string): TClubMatch[] => {
	const competition = `World Cup ${wc.number}`;
	const out: (TClubMatch | null)[] = [];
	// Matchday by matchday across groups, so the order stays chronological.
	const journeys = wc.groups[0]?.journeys.length ?? 0;
	for (let j = 0; j < journeys; j++) {
		for (const group of wc.groups) {
			group.journeys[j].value.forEach(m =>
				out.push(toClubMatch(m, cid, 'WORLD_CUP', competition, `Group ${group.name}`)),
			);
		}
	}
	wc.quarterfinals.forEach(m => out.push(toClubMatch(m, cid, 'WORLD_CUP', competition, 'Quarterfinal')));
	wc.semifinals.forEach(m => out.push(toClubMatch(m, cid, 'WORLD_CUP', competition, 'Semifinal')));
	wc.final.forEach(m => out.push(toClubMatch(m, cid, 'WORLD_CUP', competition, 'Final')));
	return out.filter((m): m is TClubMatch => m !== null);
};

/**
 * Every played match of a club, newest first: league journeys, supercup
 * (semifinal / final) and World Cup (groups and knockouts). A World Cup is
 * placed right after the last season of its cycle.
 */
export const getClubMatches = (
	cid: string,
	seasons: TSeason[],
	worldCups: TWorldCup[],
): TClubMatch[] => {
	const chronological: TClubMatch[] = [];
	const pending = [...worldCups];
	seasons.forEach((season, i) => {
		chronological.push(...seasonMatches(season, cid));
		const next = seasons[i + 1];
		const cycleEnds = season.wcCycle && (!next || next.wcCycle !== season.wcCycle);
		if (!cycleEnds) return;
		const index = pending.findIndex(wc => wc.cycle === season.wcCycle);
		if (index >= 0) chronological.push(...worldCupMatches(pending.splice(index, 1)[0], cid));
	});
	// World Cups whose cycle seasons are gone (shouldn't happen) go last.
	pending.forEach(wc => chronological.push(...worldCupMatches(wc, cid)));
	return chronological.reverse();
};

export type TClubMatchFilters = {
	opponent: string | 'ALL';
	result: TMatchResult | 'ALL';
	kind: TMatchKind | 'ALL';
};

export const DEFAULT_CLUB_MATCH_FILTERS: TClubMatchFilters = {
	opponent: 'ALL',
	result: 'ALL',
	kind: 'ALL',
};

export const filterClubMatches = (matches: TClubMatch[], filters: TClubMatchFilters) =>
	matches.filter(
		m =>
			(filters.opponent === 'ALL' || m.opponent.uuid === filters.opponent) &&
			(filters.result === 'ALL' || m.result === filters.result) &&
			(filters.kind === 'ALL' || m.kind === filters.kind),
	);

/** Opponents the club has played, most played first. */
export const getOpponents = (matches: TClubMatch[]): { club: IClub; count: number }[] => {
	const counts = new Map<string, { club: IClub; count: number }>();
	for (const m of matches) {
		const entry = counts.get(m.opponent.uuid);
		if (entry) entry.count++;
		else counts.set(m.opponent.uuid, { club: m.opponent, count: 1 });
	}
	return [...counts.values()].sort((a, b) => b.count - a.count || a.club.name.localeCompare(b.club.name));
};

export const MATCH_KIND_LABEL: Record<TMatchKind, string> = {
	LEAGUE: 'League',
	SUPERCUP: 'Supercup',
	WORLD_CUP: 'World Cup',
};
