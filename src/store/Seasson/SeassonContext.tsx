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
import atlas from '../../assets/atlas.png';
import dorados from '../../assets/dorados.png';
import leon from '../../assets/leon.png';
import morelia from '../../assets/morelia.png';
import correcaminos from '../../assets/correcaminos.png';
import tampico from '../../assets/Tampico.png';
import pachuca from '../../assets/pachuca.png';
import tijuana from '../../assets/tijuana.png';
export interface IClub {
	uuid: string;
	image?: string;
	name: string;
	color: string;
	champions?: number;
	supercups?: number;
	plateChampions?: number;
	plateSupercups?: number;
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

export type TLeague = 'PRIMERA' | 'PLATE';

export type TPromotion = {
	promoted: IClub;
	relegated: IClub;
};

export type TSeason = {
	uuid: string;
	number: number;
	isCurrent: boolean;
	league: TLeague;
	pairId?: string;
	promotion?: TPromotion;
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

// Plate Ligue: segunda división. Colores tomados del color dominante de
// cada escudo (muestreo de píxeles, ignorando fondo blanco/negro).
const plateClubs: IClub[] = [
	{
		uuid: 'plate-1',
		name: 'Atlas',
		image: atlas,
		color: '#E2001A',
		plateChampions: 0,
		plateSupercups: 0,
	},
	{
		uuid: 'plate-2',
		name: 'Dorados de Sinaloa',
		image: dorados,
		color: '#C69214',
		plateChampions: 0,
		plateSupercups: 0,
	},
	{
		uuid: 'plate-3',
		name: 'León',
		image: leon,
		color: '#00754A',
		plateChampions: 0,
		plateSupercups: 0,
	},
	{
		uuid: 'plate-4',
		name: 'Atlético Morelia',
		image: morelia,
		color: '#D9272C',
		plateChampions: 0,
		plateSupercups: 0,
	},
	{
		uuid: 'plate-5',
		name: 'Correcaminos UAT',
		image: correcaminos,
		color: '#ffa600',
		plateChampions: 0,
		plateSupercups: 0,
	},
	{
		uuid: 'plate-6',
		name: 'Tampico Madero',
		image: tampico,
		color: '#0090D0',
		plateChampions: 0,
		plateSupercups: 0,
	},
	{
		uuid: 'plate-7',
		name: 'Pachuca',
		image: pachuca,
		color: '#1E3A8A',
		plateChampions: 0,
		plateSupercups: 0,
	},
	{
		uuid: 'plate-8',
		name: 'Tijuana',
		image: tijuana,
		color: '#C8102E',
		plateChampions: 0,
		plateSupercups: 0,
	},
];
export type TState = {
	myClub: IClub | undefined;
	seasons: TSeason[];
	clubs: IClub[];
	plateClubs: IClub[];
	dispatch: (action: TAction) => void;
};
export const globalState: TState = {
	myClub: clubs[0],
	seasons,
	clubs,
	plateClubs,
	dispatch: () => { },
};
export const SeassonContext = createContext(globalState);
