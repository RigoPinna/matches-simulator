import React, { useReducer } from 'react';
import { SeasonContext, globalState } from './SeasonContext';
import { seassonReducer } from './seassonReducer';

type TSeasonProvider = { children: React.ReactNode };
export const SeasonProvide = ({ children }: TSeasonProvider) => {
	const [state, dispatch] = useReducer(seassonReducer, globalState);

	return <SeasonContext.Provider value={{ ...state, dispatch }}>{children}</SeasonContext.Provider>;
};
