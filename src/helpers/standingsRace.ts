import { IClub, TSeason } from '../store';

export type TRaceRow = {
	club: IClub;
	pts: number;
	gd: number;
	gf: number;
	played: number;
	/** 0-based position in this frame. */
	position: number;
};
/** Standings after `journey` journeys (frame 0 = before kick-off). */
export type TRaceFrame = { journey: number; rows: TRaceRow[] };

/**
 * Rebuilds the regular-season table after every journey from the match
 * scores, for the "season replay" animation. Sorting matches the league
 * (pts, goal difference, goals for); remaining ties keep the previous
 * frame's order so bars don't jump around. The last frame uses the official
 * final table order.
 */
export const getStandingsFrames = (season: TSeason): TRaceFrame[] => {
	const clubs = season.table.map(row => row.club);
	const totals = new Map(clubs.map(club => [club.uuid, { pts: 0, gd: 0, gf: 0, played: 0 }]));
	let previous = new Map(
		[...clubs].sort((a, b) => a.name.localeCompare(b.name)).map((club, i) => [club.uuid, i]),
	);

	const snapshot = (journey: number, order?: string[]): TRaceFrame => {
		const rows = clubs.map(club => ({ club, ...totals.get(club.uuid)!, position: 0 }));
		rows.sort((a, b) =>
			order
				? order.indexOf(a.club.uuid) - order.indexOf(b.club.uuid)
				: b.pts - a.pts ||
					b.gd - a.gd ||
					b.gf - a.gf ||
					previous.get(a.club.uuid)! - previous.get(b.club.uuid)!,
		);
		rows.forEach((row, i) => (row.position = i));
		previous = new Map(rows.map(row => [row.club.uuid, row.position]));
		return { journey, rows };
	};

	const frames: TRaceFrame[] = [snapshot(0)];
	const journeys = season.fase.regular.matches.matches;
	journeys.forEach((journey, j) => {
		for (const match of journey.value) {
			const { local, visit } = match;
			if (match.status !== 'DONE' || typeof local.score !== 'number' || typeof visit.score !== 'number') {
				continue;
			}
			const l = totals.get(local.uuid);
			const v = totals.get(visit.uuid);
			if (!l || !v) continue;
			l.played++;
			v.played++;
			l.gf += local.score;
			v.gf += visit.score;
			l.gd += local.score - visit.score;
			v.gd += visit.score - local.score;
			if (local.score > visit.score) l.pts += 3;
			else if (local.score < visit.score) v.pts += 3;
			else {
				l.pts += 1;
				v.pts += 1;
			}
		}
		const isLast = j === journeys.length - 1;
		frames.push(snapshot(j + 1, isLast ? season.table.map(row => row.club.uuid) : undefined));
	});
	return frames;
};

/**
 * Positions gained (+) or lost (−) by each club since the previous journey:
 * compares the current table with the standings before the latest journey
 * that has results. Empty before the second journey (nothing to compare).
 */
export const getPositionChanges = (season: TSeason): Map<string, number> => {
	const changes = new Map<string, number>();
	const journeys = season.fase.regular.matches.matches;
	const done = journeys.filter(j => j.status === 'DONE').length;
	const partial = journeys[done]?.value.some(m => m.status === 'DONE') ?? false;
	// Standings before the journey currently reflected in the table.
	const previousIndex = partial ? done : done - 1;
	if (previousIndex < 1) return changes;
	const previous = getStandingsFrames(season)[previousIndex].rows;
	season.table.forEach((row, position) => {
		const before = previous.find(p => p.club.uuid === row.club.uuid);
		if (before) changes.set(row.club.uuid, before.position - position);
	});
	return changes;
};

export type TFormResult = 'WIN' | 'DRAW' | 'LOSS';

/** Last `size` results of each club in this season (oldest → newest). */
export const getSeasonForm = (season: TSeason, size = 5): Map<string, TFormResult[]> => {
	const form = new Map<string, TFormResult[]>(season.table.map(row => [row.club.uuid, []]));
	const phases = [season.fase.regular, season.fase.semifinal, season.fase.final];
	for (const fase of phases) {
		for (const journey of fase.matches.matches) {
			for (const { local, visit, status } of journey.value) {
				if (status !== 'DONE' || typeof local.score !== 'number' || typeof visit.score !== 'number') continue;
				const l: TFormResult = local.score > visit.score ? 'WIN' : local.score < visit.score ? 'LOSS' : 'DRAW';
				const v: TFormResult = l === 'WIN' ? 'LOSS' : l === 'LOSS' ? 'WIN' : 'DRAW';
				form.get(local.uuid)?.push(l);
				form.get(visit.uuid)?.push(v);
			}
		}
	}
	for (const [uuid, results] of form) form.set(uuid, results.slice(-size));
	return form;
};
