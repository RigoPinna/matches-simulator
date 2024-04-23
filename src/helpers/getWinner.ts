import { ITeamMatch, TMatches } from '../store';
export type TWinner = {
	type: 'LOCAL' | 'VISITOR' | 'DRAW';
	winner: ITeamMatch;
	loser: ITeamMatch;
};
export const getWinner = ({ local, visit }: TMatches): TWinner => {
	const scoreLocal = local.score ? local.score : 0;
	const scoreVisitor = visit.score ? visit.score : 0;
	switch (true) {
		case scoreLocal > scoreVisitor:
			return {
				type: 'LOCAL',
				winner: local,
				loser: visit,
			};
		case scoreLocal < scoreVisitor:
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
