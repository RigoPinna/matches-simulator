import { IClub, TMatches } from '../store';

export const isMyClub = ({ local, visit }: TMatches, myClub: IClub) => {
	return myClub.uuid === local.uuid || myClub.uuid === visit.uuid;
};
