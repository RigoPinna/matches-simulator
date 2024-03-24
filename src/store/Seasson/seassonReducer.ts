import { v4 as getUuid } from 'uuid';
import { IItemTable, TSeason, TState, globalState } from './SeassonContext';

export type TType =
	| '[SEASSON] - SET SEASSONS'
	| '[SEASSON] - NEW SEASSON'
	| '[SEASSON] - UPDATE FASE'
	| '[SEASSON] - UPDATE TABLE'
	| '[SEASSON] - ADD MATCH SCORE'
	| '[SEASSON] - ORDER TABLE';

export type TAction = {
	type: TType;
	payload?: any;
};
export type TSeasonReducer = (state: TState, action: TAction) => TState;

export const seassonReducer: TSeasonReducer = (state = globalState, action) => {
	switch (action.type) {
		case '[SEASSON] - SET SEASSONS': {
			return {
				...state,
				seasons: action.payload,
			};
		}
		case '[SEASSON] - NEW SEASSON': {
			const newSeason: TSeason = {
				uuid: getUuid(),
				number: state.seasons.length + 1,
				fase: 'REGULAR',
				isCurrent: true,
				table: state.clubs.map(
					club =>
						({
							club,
							ga: 0,
							gd: 0,
							gf: 0,
							md: 0,
							mg: 0,
							ml: 0,
							mw: 0,
							pts: 0,
						}) as IItemTable,
				),
			};
			const oldSeassons = state.seasons.map(seasson => ({
				...seasson,
				isCurrent: false,
			}));
			localStorage.setItem('seassons', JSON.stringify([...oldSeassons, newSeason]));
			const seasons = [...oldSeassons, newSeason];
			return { ...state, seasons };
		}

		default:
			return state;
	}
};
