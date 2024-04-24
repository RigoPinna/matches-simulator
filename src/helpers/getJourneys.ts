import { v4 as getUuid } from 'uuid';
import { IClub, TJourney, TMatches } from '../store';

/**
 * The function `getMatches` generates match pairings between clubs with initial scores set to 0.
 * @param {IClub[]} clubs - An array of objects representing different clubs.
 * @returns The `getMatches` function returns an array of match objects (`TMatches`) that represent all
 * possible matches between the clubs provided in the `clubs` array. Each match object contains a
 * unique identifier (`uuid`), information about the local club with an initial score of 0, and
 * information about the visiting club with an initial score of 0.
 */
const getMatches = (clubs: IClub[]) => {
	const matches: TMatches[] = [];
	for (let i = 0; i < clubs.length; i++) {
		for (let j = i + 1; j < clubs.length; j++) {
			matches.push({
				uuid: getUuid(),
				local: {
					...clubs[i],
					score: null,
				},
				visit: {
					...clubs[j],
					score: null,
				},
				status: 'TODO',
			});
		}
	}
	return matches;
};

/**
 * The function `getJourneys` generates a schedule of matches for a given set of clubs by randomly
 * assigning matches to each journey.
 * @param {IClub[]} clubs - The `getJourneys` function takes an array of clubs as input. Each club in
 * the array should have a specific structure defined by the `IClub` interface. The function then
 * generates a schedule of matches between the clubs to create a set of journeys for a competition or
 * league.
 * @returns An array of arrays representing the journeys for the given clubs, where each inner array
 * contains a set of matches for a specific journey.
 */
export const getJourneys = (clubs: IClub[]) => {
	const matches = getMatches(clubs);
	const numbersOfJourney = clubs.length - 1;
	const matchesByJourney = matches.length / numbersOfJourney;
	const journeys: TJourney[] = [];
	const clubsByJourney = new Set<string>();
	let matchesCopy = [...matches];
	for (let i = 0; i < numbersOfJourney; i++) {
		const journey: Array<TMatches> = [];
		let aux = 0;
		while (journey.length < matchesByJourney && aux < 100) {
			const match = matchesCopy[Math.floor(Math.random() * matchesCopy.length)];
			if (!clubsByJourney.has(match.local.uuid) && !clubsByJourney.has(match.visit.uuid)) {
				journey.push(match);
				clubsByJourney.add(match.local.uuid);
				clubsByJourney.add(match.visit.uuid);
				matchesCopy = [...matchesCopy.filter(m => m.uuid !== match.uuid)];
			}
			if (aux === 99) {
				matchesCopy = [...matchesCopy.filter(m => m.uuid !== match.uuid)];
				journey.push(match);
				break;
			}
			aux++;
		}
		clubsByJourney.clear();
		journeys.push({
			jid: getUuid(),
			status: 'TODO',
			value: journey,
		});
	}

	return journeys;
};
