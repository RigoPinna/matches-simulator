import { TMatches } from '../store';

export const getRandomScore = (match: TMatches) => {
	const localScore = Math.floor(Math.random() * 5);
	const visitScore = Math.floor(Math.random() * 5);
	const matchWithScore: TMatches = {
		...match,
		status: 'DONE',
		local: {
			...match.local,
			score: localScore,
		},
		visit: {
			...match.visit,
			score: visitScore,
		},
	};
	return matchWithScore;
};

/**
 * Random scoreline (0-4 goals each, same range as getRandomScore) for the
 * "Simulate" button of the score modal. `noDraw` re-rolls ties (knockouts).
 */
export const getRandomResult = (noDraw = false): { local: number; visit: number } => {
	let local: number;
	let visit: number;
	do {
		local = Math.floor(Math.random() * 5);
		visit = Math.floor(Math.random() * 5);
	} while (noDraw && local === visit);
	return { local, visit };
};
