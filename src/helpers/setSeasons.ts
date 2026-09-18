import { TSeason } from '../store';

export const setSeasons = (currentSeason: TSeason, seasons: TSeason[]) => {
	return setSeasonsBatch([currentSeason], seasons);
};

/**
 * Replaces several seasons at once (e.g. a season and its paired shadow
 * season) with a single localStorage write.
 */
export const setSeasonsBatch = (updatedSeasons: TSeason[], seasons: TSeason[]) => {
	const byUuid = new Map(updatedSeasons.map(season => [season.uuid, season]));
	const newSeasons = seasons.map(season => byUuid.get(season.uuid) || season);

	localStorage.setItem('seasons', JSON.stringify(newSeasons));

	return newSeasons;
};
