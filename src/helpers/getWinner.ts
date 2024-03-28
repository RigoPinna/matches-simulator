import { TMatches } from '../store';

export const getWinner = ({ local, visit }: TMatches) => {
	switch (true) {
		case local.score > visit.score:
			return local.uuid;
		case local.score < visit.score:
			return visit.uuid;

		default:
			return undefined;
	}
};
