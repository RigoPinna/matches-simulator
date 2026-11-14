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
