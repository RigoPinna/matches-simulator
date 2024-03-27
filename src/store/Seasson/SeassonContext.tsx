import { createContext } from 'react';
import { TAction } from './seassonReducer';
import america from '../../assets/america-logo.png';
import tigres from '../../assets/Tigres-logo.png';
import chivas from '../../assets/chivas-logo.png';
import cruz_azul from '../../assets/cruz-azul-logo.png';
import monterrey from '../../assets/monterrey-logo.png';
import santos from '../../assets/santos-logo.png';
export interface IClub {
	uuid: string;
	image: string;
	name: string;
}

export interface IItemTable {
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
interface ITeamMatch extends IClub {
	score: number;
}

export type TMatches = { uuid: string; local: ITeamMatch; visit: ITeamMatch };
export type TMatch = {
	uuid: string;
	title: string;
	matches: Array<TMatches[]>;
};
export type TFase = {
	status: 'ACTIVE' | 'BLOCKED' | 'FINISHED';
	matches: TMatch;
};
export type TSeason = {
	uuid: string;
	number: number;
	isCurrent: boolean;
	fase: {
		regular: TFase;
		semifinal: TFase;
		final: TFase;
	};
	matches?: TMatch[];
	table: IItemTable[];
	winder?: string;
};

const seasons: TSeason[] = [];
const clubs: IClub[] = [
	{
		uuid: '1',
		name: 'América',
		image: america,
	},
	{
		uuid: '2',
		name: 'Chivas',
		image: chivas,
	},
	{
		uuid: '3',
		name: 'Cruz Azul',
		image: cruz_azul,
	},
	{
		uuid: '4',
		name: 'Monterrey',
		image: monterrey,
	},
	{
		uuid: '5',
		name: 'Santos',
		image: santos,
	},
	{
		uuid: '6',
		name: 'Tigres',
		image: tigres,
	},
];
export type TState = {
	seasons: TSeason[];
	clubs: IClub[];
	dispatch: (action: TAction) => void;
};
export const globalState: TState = {
	seasons,
	clubs,
	dispatch: () => {},
};
export const SeassonContext = createContext(globalState);
