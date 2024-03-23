import { createContext } from 'react';
import { TAction } from './seassonReducer';

interface IClub {
	image: string;
	name: string;
}

interface IItemTable {
	club: IClub;
	mg: number;
	mw: number;
	md: number;
	ml: number;
	pts: number;
	gf: number;
	ga: number;
	gd: number;
}
export type TFase = 'REGULAR' | 'SEMI' | 'FINAL';
export type TSeason = {
	uuid: string;
	number: number;
	isCurrent: boolean;
	fase: TFase;
	table: IItemTable[];
};

const seasons: TSeason[] = [];

export type TState = {
	seasons: TSeason[];
	dispatch: (action: TAction) => void;
};
export const globalState: TState = {
	seasons,
	dispatch: () => {},
};
export const SeasonContext = createContext(globalState);
