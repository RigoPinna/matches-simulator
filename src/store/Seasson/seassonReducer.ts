import { v4 as getUuid } from 'uuid';
import { IItemTable, TJourney, TSeason, TState, globalState } from './SeassonContext';
import { getJourneys, orderTable } from '../../helpers';
import { getRandomScore } from '../../helpers/getRandomScore';

export type TType =
	| '[SEASSON] - SET SEASSONS'
	| '[SEASSON] - NEW SEASSON'
	| '[SEASSON] - UPDATE FASE'
	| '[SEASSON] - UPDATE TABLE'
	| '[SEASSON-REGULAR] - ADD MATCH SCORE'
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
				fase: {
					regular: {
						status: 'ACTIVE',
						matches: {
							uuid: getUuid(),
							title: 'Regular',
							matches: getJourneys(state.clubs),
						},
						currentJourney: 1,
					},
					semifinal: {
						status: 'BLOCKED',
						matches: {
							uuid: getUuid(),
							title: 'Semifinal',
							matches: [],
						},
					},
					final: {
						status: 'BLOCKED',
						matches: {
							uuid: getUuid(),
							title: 'final',
							matches: [],
						},
					},
				},
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
		case '[SEASSON-REGULAR] - ADD MATCH SCORE': {
			const { uuid, matches } = action.payload as { uuid: string; matches: TJourney };
			const season = state.seasons.find(s => s.uuid === uuid) as TSeason;
			const matchesWithScore: TJourney = {
				jid: matches.jid,
				value: matches.value.map(match => getRandomScore(match)),
			};
			const tableOrded = orderTable(season.table, matchesWithScore);
			const currentJourney = season.fase.regular.currentJourney;
			const updatedJourneys = season.fase.regular.matches.matches.map(jry => {
				return jry.jid === matchesWithScore.jid ? matchesWithScore : jry;
			});

			const seasonUpdated: TSeason = {
				...season,
				table: tableOrded,
				fase: {
					...season.fase,
					regular: {
						...season.fase.regular,
						currentJourney: currentJourney + 1,
						matches: {
							...season.fase.regular.matches,
							matches: updatedJourneys,
						},
					},
				},
			};

			const seasonsUpdated = state.seasons.map(sn =>
				sn.uuid === seasonUpdated.uuid ? seasonUpdated : sn,
			);
			return {
				...state,
				seasons: seasonsUpdated,
			};
		}

		default:
			return state;
	}
};
