import { ITeamMatch, TMatches } from '../store';
export type TWinner = {
	type: 'LOCAL' | 'VISITOR' | 'DRAW';
	winner: ITeamMatch;
	loser: ITeamMatch;
};
export const getWinner = ({ local, visit }: TMatches): TWinner => {
	switch (true) {
		case local.score > visit.score:
			return {
				type: 'LOCAL',
				winner: local,
				loser: visit,
			};
		case local.score < visit.score:
			return {
				type: 'VISITOR',
				winner: visit,
				loser: local,
			};

		default:
			return {
				type: 'DRAW',
				winner: local,
				loser: visit,
			};
	}
};
