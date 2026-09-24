import { IClub, ITeamMatch, TFase, TSeason } from '../store';

const BASE64_IMAGE_PREFIX = 'data:image';

export type TImageByUuid = Map<string, string | undefined>;

/**
 * The lookup should always be built from the hardcoded, module-level club
 * arrays (`globalState.clubs` / `globalState.plateClubs`), never from
 * whatever is in localStorage — those defaults always reflect the current
 * build's (clean, external-file) image paths, while the saved roster can
 * itself still be carrying an old base64 blob from before this existed.
 * Both leagues' defaults are combined because a club can have moved
 * divisions since it was first created (promotion/relegation), so its
 * current entry might only exist in the "other" league's default array.
 */
export const buildImageLookup = (clubs: IClub[], plateClubs: IClub[]): TImageByUuid => {
	const map = new Map<string, string | undefined>();
	for (const club of [...clubs, ...plateClubs]) {
		map.set(club.uuid, club.image);
	}
	return map;
};

function cleanSnapshot<T extends { uuid: string; image?: string }>(
	snapshot: T,
	imageByUuid: TImageByUuid,
): T {
	if (!snapshot.image || !snapshot.image.startsWith(BASE64_IMAGE_PREFIX)) return snapshot;
	if (!imageByUuid.has(snapshot.uuid)) return snapshot;
	return { ...snapshot, image: imageByUuid.get(snapshot.uuid) };
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
 * base64 blob for the club's current lightweight image path, so old saves
 * shrink back down automatically the next time they're loaded.
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
