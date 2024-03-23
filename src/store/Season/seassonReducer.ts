import { TState, globalState } from './SeasonContext';

export type TType =
	| '[SEASON] - NEW SEASON'
	| '[SEASON] - UPDATE FASE'
	| '[SEASON] - UPDATE TABLE'
	| '[SEASON] - ADD MATCH SCORE'
	| '[SEASON] - ORDER TABLE';

export type TAction = {
	type: TType;
	payload: any;
};
export type TSeasonReducer = (state: TState, action: TAction) => TState;

export const seassonReducer: TSeasonReducer = (state = globalState, action) => {
	switch (action.type) {
		case '[SEASON] - NEW SEASON':
			return state;

		default:
			return state;
	}
};
