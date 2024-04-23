import { TSeason } from '../store';

export const setSeasons = (currentSeason: TSeason, seasons: TSeason[]) => {
	const newSeasons = seasons.map(season =>
		season.uuid === currentSeason.uuid ? currentSeason : season,
	);

	// localStorage.setItem('seasons', JSON.stringify(newSeasons));

	return newSeasons;
};
