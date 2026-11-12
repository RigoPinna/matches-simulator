import { IItemTable, TLeague, TSeason } from '../store';

/**
 * Promotion/relegation runs every 2 seasons. Given any season number, this
 * returns the [start, end] pair of season numbers that make up its cycle —
 * e.g. 1 and 2 both belong to [1, 2], 3 and 4 both belong to [3, 4].
 */
export const getCycleRange = (number: number): [number, number] => {
	const start = number % 2 === 1 ? number : number - 1;
	return [start, start + 1];
};

/** Sums the table rows of `seasons` per club, sorted by pts, gd, gf. */
const sumTables = (seasons: TSeason[]): IItemTable[] => {
	const totals = new Map<string, IItemTable>();
	for (const season of seasons) {
		for (const row of season.table) {
			const existing = totals.get(row.club.uuid);
			totals.set(
				row.club.uuid,
				existing
					? {
						...existing,
						pts: existing.pts + row.pts,
						gf: existing.gf + row.gf,
						ga: existing.ga + row.ga,
						gd: existing.gd + row.gd,
						mg: existing.mg + row.mg,
						mw: existing.mw + row.mw,
						md: existing.md + row.md,
						ml: existing.ml + row.ml,
					}
					: { ...row },
			);
		}
	}
	return [...totals.values()].sort((a, b) => {
		if (a.pts !== b.pts) return b.pts - a.pts;
		if (a.gd !== b.gd) return b.gd - a.gd;
		return b.gf - a.gf;
	});
};

/**
 * Sums each club's table row across the 2-season cycle that `upToNumber`
 * belongs to, for the given league. Seasons from the cycle that don't exist
 * yet (e.g. viewing season 3 before season 4 was created) are simply
 * skipped, so mid-cycle this reflects "if the cycle ended right now".
 */
export const aggregateTable = (
	seasons: TSeason[],
	league: TLeague,
	upToNumber: number,
): IItemTable[] => {
	const [start, end] = getCycleRange(upToNumber);
	return sumTables(
		seasons.filter(s => s.league === league && s.number >= start && s.number <= end),
	);
};

/**
 * Same idea for the World Cup: sums every season of `league` that belongs to
 * World Cup cycle `cycle`. Its top 4 qualify. A club that changed division
 * mid-cycle only counts the points it made while in this league.
 */
export const aggregateWorldCupTable = (
	seasons: TSeason[],
	league: TLeague,
	cycle: number,
): IItemTable[] => sumTables(seasons.filter(s => s.league === league && s.wcCycle === cycle));
