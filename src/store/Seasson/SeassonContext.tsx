import { createContext } from 'react';
import { TAction } from './seassonReducer';
import america from '../../assets/america-logo.png';
import tigres from '../../assets/Tigres-logo.png';
import chivas from '../../assets/chivas-logo.png';
import cruz_azul from '../../assets/cruz-azul-logo.png';
import monterrey from '../../assets/monterrey-logo.png';
import santos from '../../assets/santos-logo.png';
interface IClub {
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
export type TFase = 'REGULAR' | 'SEMI' | 'FINAL';
export type TSeason = {
	uuid: string;
	number: number;
	isCurrent: boolean;
	fase: TFase;
	table: IItemTable[];
	winder?: string;
};

const seasons: TSeason[] = [];
const clubs: IClub[] = [
	{
		name: 'América',
		image: america,
	},
	{
		name: 'Chivas',
		image: chivas,
	},
	{
		name: 'Cruz Azul',
		image: cruz_azul,
	},
	{
		name: 'Monterrey',
		image: monterrey,
	},
	{
		name: 'Santos',
		image: santos,
	},
	{
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
