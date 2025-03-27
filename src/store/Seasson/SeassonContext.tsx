import { createContext } from 'react';
import { TAction } from './seassonReducer';
import america from '../../assets/america-logo.png';
import tigres from '../../assets/Tigres-logo.png';
import chivas from '../../assets/chivas-logo.png';
import cruz_azul from '../../assets/cruz-azul-logo.png';
import monterrey from '../../assets/monterrey-logo.png';
import santos from '../../assets/santos-logo.png';
import pumas from '../../assets/pumas-logo.png';
import toluca from '../../assets/toluca-logo.png';
export interface IClub {
	uuid: string;
	image: string;
	name: string;
	color: string;
	champions?: number;
	supercups?: number;
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
export interface ITeamMatch extends IClub {
	score: number | null;
}
export type TStatusMatch = 'TODO' | 'DONE';
export type TMatches = { uuid: string; local: ITeamMatch; visit: ITeamMatch; status: TStatusMatch };
export type TJourney = {
	jid: string;
	status: TStatusMatch;
	value: TMatches[];
};
export type TMatch = {
	uuid: string;
	title: string;
	matches: TJourney[];
};
export type TStatusFase = 'ACTIVE' | 'BLOCKED' | 'FINISHED';
export type TFase = {
	status: TStatusFase;
	matches: TMatch;
	currentJourney: number;
};

export type TSeason = {
	uuid: string;
	number: number;
	isCurrent: boolean;
	fase: {
		regular: TFase;
		semifinal: TFase & { winners?: ITeamMatch[] };
		final: TFase & { winners?: ITeamMatch[] };
	};
	matches?: TMatch[];
	table: IItemTable[];
	winner: ITeamMatch[] | null;
};

const seasons: TSeason[] = [];
const clubs: IClub[] = [
	{
		uuid: '1',
		name: 'América',
		image: america,
		color: '#FFEB00',
		champions: 0,
		supercups: 0,
	},
	{
		uuid: '2',
		name: 'Chivas',
		image: chivas,
		color: '#E22844',
		champions: 0,
		supercups: 0,
	},
	{
		uuid: '3',
		name: 'Cruz Azul',
		image: cruz_azul,
		color: '#2E9FC2',
		champions: 0,
		supercups: 0,
	},
	{
		uuid: '4',
		name: 'Monterrey',
		image: monterrey,
		color: '#1E3C67',
		champions: 0,
		supercups: 0,
	},
	{
		uuid: '5',
		name: 'Santos',
		image: santos,
		color: '#10C868',
		champions: 0,
		supercups: 0,
	},
	{
		uuid: '6',
		name: 'Tigres',
		image: tigres,
		color: '#FFC200',
		champions: 0,
		supercups: 0,
	},
	{
		uuid: '7',
		name: 'Pumas',
		image: pumas,
		color: '#a59366',
		champions: 0,
		supercups: 0,
	},
	{
		uuid: '8',
		name: 'Toluca',
		image: toluca,
		color: '#d11c34',
		champions: 0,
		supercups: 0,
	},
];
export type TState = {
	myClub: IClub | undefined;
	seasons: TSeason[];
	clubs: IClub[];
	dispatch: (action: TAction) => void;
};
export const globalState: TState = {
	myClub: clubs[0],
	seasons,
	clubs,
	dispatch: () => { },
};
export const SeassonContext = createContext(globalState);
