import React, { useReducer } from 'react';
import { SeassonContext, globalState } from './SeassonContext';
import { seassonReducer } from './seassonReducer';

type TSeasonProvider = { children: React.ReactNode };
export const SeasonProvider = ({ children }: TSeasonProvider) => {
	const [state, dispatch] = useReducer(seassonReducer, globalState);

	return (
		<SeassonContext.Provider value={{ ...state, dispatch }}>{children}</SeassonContext.Provider>
	);
};
