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
