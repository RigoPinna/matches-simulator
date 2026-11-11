import { IClub, ITeamMatch, TFase, TSeason, TWorldCup } from '../store';

const BASE64_IMAGE_PREFIX = 'data:image';

export type TImageByUuid = Map<string, string | undefined>;

/**
 * The lookup should always be built from the hardcoded, module-level club
 * arrays (`globalState.clubs` / `globalState.plateClubs` / the international
 * defaults), never from whatever is in localStorage — those defaults always
 * reflect the current build's (clean, external-file) image paths, while the
 * saved roster can itself still be carrying an old base64 blob from before
 * this existed. Every league's defaults are combined because a club can
 * have moved divisions since it was first created (promotion/relegation),
 * so its current entry might only exist in the "other" league's array.
 */
export const buildImageLookup = (...rosters: IClub[][]): TImageByUuid => {
	const map = new Map<string, string | undefined>();
	for (const club of rosters.flat()) {
		map.set(club.uuid, club.image);
	}
	return map;
};

function cleanSnapshot<T extends { uuid: string; image?: string }>(
	snapshot: T,
	imageByUuid: TImageByUuid,
): T {
	if (!imageByUuid.has(snapshot.uuid)) return snapshot;
	const current = imageByUuid.get(snapshot.uuid);
	// The club has a logo in this build and the snapshot is missing it or
	// points elsewhere (a logo added later, e.g. international clubs, or an
	// old base64 blob): use the current one.
	if (current && snapshot.image !== current) return { ...snapshot, image: current };
	if (!current && snapshot.image?.startsWith(BASE64_IMAGE_PREFIX)) {
		return { ...snapshot, image: current };
	}
	return snapshot;
}

function cleanFase<F extends TFase & { winners?: ITeamMatch[] }>(
	fase: F,
	imageByUuid: TImageByUuid,
	onChange: () => void,
): F {
	return {
		...fase,
		matches: {
			...fase.matches,
			matches: fase.matches.matches.map(journey => ({
				...journey,
				value: journey.value.map(match => {
					const local = cleanSnapshot(match.local, imageByUuid);
					const visit = cleanSnapshot(match.visit, imageByUuid);
					if (local === match.local && visit === match.visit) return match;
					onChange();
					return { ...match, local, visit };
				}),
			})),
		},
	} as F;
}

/**
 * Saves created before club logos were kept as external files (rather than
 * inlined as base64) still carry a full base64 copy of the image on every
 * match and table row — easily hundreds of KB duplicated per season, which
 * on its own can push localStorage past quota. This swaps any leftover
 * base64 blob (or missing logo) for the club's current lightweight image
 * path, so old saves shrink back down / pick up new logos automatically
 * the next time they're loaded.
 */
export const sanitizeSeasonImages = (
	seasons: TSeason[],
	imageByUuid: TImageByUuid,
): { seasons: TSeason[]; changed: boolean } => {
	let changed = false;
	const onChange = () => {
		changed = true;
	};

	const cleanedSeasons = seasons.map(season => {
		const table = season.table.map(row => {
			const club = cleanSnapshot(row.club, imageByUuid);
			return club === row.club ? row : (onChange(), { ...row, club });
		});

		return {
			...season,
			table,
			fase: {
				regular: cleanFase(season.fase.regular, imageByUuid, onChange),
				semifinal: cleanFase(season.fase.semifinal, imageByUuid, onChange),
				final: cleanFase(season.fase.final, imageByUuid, onChange),
			},
		};
	});

	return changed ? { seasons: cleanedSeasons, changed } : { seasons, changed };
};

/** Same idea, applied to a club roster array (`clubs` / `plateClubs`) itself. */
export const sanitizeClubImages = (
	clubs: IClub[],
	imageByUuid: TImageByUuid,
): { clubs: IClub[]; changed: boolean } => {
	let changed = false;
	const cleaned = clubs.map(club => {
		const next = cleanSnapshot(club, imageByUuid);
		if (next !== club) changed = true;
		return next;
	});
	return changed ? { clubs: cleaned, changed } : { clubs, changed };
};

/**
 * Walks any JSON-like value and refreshes every club snapshot in it (any
 * object with a string uuid plus name and color). Used for World Cups,
 * whose club snapshots live in several differently-shaped places.
 */
function cleanDeep<T>(value: T, imageByUuid: TImageByUuid, onChange: () => void): T {
	if (Array.isArray(value)) {
		let arrayChanged = false;
		const next = value.map(item => {
			const cleaned = cleanDeep(item, imageByUuid, onChange);
			if (cleaned !== item) arrayChanged = true;
			return cleaned;
		});
		return (arrayChanged ? next : value) as T;
	}
	if (!value || typeof value !== 'object') return value;
	const record = value as Record<string, unknown>;
	let next: Record<string, unknown> = record;
	if (typeof record.uuid === 'string' && 'name' in record && 'color' in record) {
		next = cleanSnapshot(record as { uuid: string; image?: string }, imageByUuid);
		if (next !== record) onChange();
	}
	for (const [key, child] of Object.entries(next)) {
		const cleaned = cleanDeep(child, imageByUuid, onChange);
		if (cleaned !== child) {
			if (next === record) next = { ...record };
			next[key] = cleaned;
		}
	}
	return next as T;
}

export const sanitizeWorldCupImages = (
	worldCups: TWorldCup[],
	imageByUuid: TImageByUuid,
): { worldCups: TWorldCup[]; changed: boolean } => {
	let changed = false;
	const cleaned = cleanDeep(worldCups, imageByUuid, () => {
		changed = true;
	});
	return { worldCups: cleaned, changed };
};
