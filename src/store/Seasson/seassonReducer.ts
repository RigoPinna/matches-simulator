import { v4 as getUuid } from 'uuid';
import {
	IItemTable,
	TFase,
	TJourney,
	TMatches,
	TSeason,
	TState,
	TStatusFase,
	globalState,
} from './SeassonContext';
import { getJourneys, getWinner, orderTable, setSeasons } from '../../helpers';
import { getRandomScore } from '../../helpers/getRandomScore';

export type TType =
	| '[SEASSON] - SET SEASSONS'
	| '[SEASSON] - NEW SEASSON'
	| '[SEASSON] - UPDATED STATUS FASE'
	| '[SEASSON] - UPDATE TABLE'
	| '[SEASSON-REGULAR] - ADD MATCH SCORE'
	| '[SEASSON-SEMIFINALS] - SET MATCHES'
	| '[SEASSON-SEMIFINALS] - ADD MATCH SCORE'
	| '[SEASSON-FINAL] - SET MATCHES'
	| '[SEASSON-FINAL] - ADD MATCH SCORE'
	| '[SEASSON] - ORDER TABLE';

export type TAction = {
	type: TType;
	payload?: any;
};
export type TBlockedFase = {
	sid: string;
	type: 'regular' | 'semifinal' | 'final';
	status: TStatusFase;
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
						currentJourney: 1,
						winners: [],
						matches: {
							uuid: getUuid(),
							title: 'Semifinal',
							matches: [],
						},
					},
					final: {
						status: 'BLOCKED',
						currentJourney: 1,
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
			localStorage.setItem('seasons', JSON.stringify([...oldSeassons, newSeason]));
			const seasons = [...oldSeassons, newSeason];
			return { ...state, seasons };
		}
		case '[SEASSON-REGULAR] - ADD MATCH SCORE': {
			const { uuid, matches } = action.payload as { uuid: string; matches: TJourney };
			const season = state.seasons.find(s => s.uuid === uuid) as TSeason;
			const matchesDone = matches.value.map(match => getRandomScore(match));
			const matchesWithScore: TJourney = {
				jid: matches.jid,
				status: matchesDone.some(match => match.status === 'TODO') ? 'TODO' : 'DONE',
				value: matchesDone,
			};
			const tableOrded = orderTable(season.table, matchesWithScore);
			const currentJourney = season.fase.regular.currentJourney;
			const updatedJourneys = season.fase.regular.matches.matches.map(jry => {
				return jry.jid === matchesWithScore.jid ? matchesWithScore : jry;
			});
			const isFinished = updatedJourneys.some(jourey => jourey.status === 'TODO');
			const seasonUpdated: TSeason = {
				...season,
				table: tableOrded,
				fase: {
					...season.fase,
					regular: {
						...season.fase.regular,
						currentJourney: isFinished ? currentJourney + 1 : currentJourney,
						status: isFinished ? 'ACTIVE' : 'FINISHED',
						matches: {
							...season.fase.regular.matches,
							matches: updatedJourneys,
						},
					},
				},
			};

			return {
				...state,
				seasons: setSeasons(seasonUpdated, state.seasons),
			};
		}
		case '[SEASSON] - UPDATED STATUS FASE': {
			const { sid, type, status } = action.payload as TBlockedFase;

			const season = state.seasons.find(season => season.uuid === sid) as TSeason;

			const fase = { ...season.fase[type], status };

			const updatedFases = { ...season.fase, [type]: fase };

			const updatedSeason = { ...season, fase: updatedFases };

			return {
				...state,
				seasons: setSeasons(updatedSeason, state.seasons),
			};
		}
		case '[SEASSON-SEMIFINALS] - SET MATCHES': {
			const sid = action.payload;
			const season = state.seasons.find(season => season.uuid === sid) as TSeason;
			const semifinals: TJourney = {
				jid: getUuid(),
				status: 'TODO',
				value: [
					{
						uuid: getUuid(),
						status: 'TODO',
						local: {
							...season.table[0].club,
							score: 0,
						},
						visit: {
							...season.table[3].club,
							score: 0,
						},
					},
					{
						uuid: getUuid(),
						status: 'TODO',
						local: {
							...season.table[1].club,
							score: 0,
						},
						visit: {
							...season.table[2].club,
							score: 0,
						},
					},
				],
			};

			const fase: TFase = {
				...season.fase.semifinal,
				status: 'ACTIVE',
				matches: {
					uuid: getUuid(),
					title: 'Semifinal',
					matches: [semifinals],
				},
			};
			const updatedSeason: TSeason = {
				...season,
				fase: {
					...season.fase,
					semifinal: fase,
				},
			};

			return {
				...state,
				seasons: setSeasons(updatedSeason, state.seasons),
			};
		}
		case '[SEASSON-SEMIFINALS] - ADD MATCH SCORE': {
			const { uuid, matches } = action.payload as { uuid: string; matches: TJourney };
			const season = state.seasons.find(s => s.uuid === uuid) as TSeason;
			const matchesDone = matches.value.map(match => {
				let matchWithScore: TMatches;
				do {
					matchWithScore = getRandomScore(match);
				} while (matchWithScore.local.score === matchWithScore.visit.score);

				return matchWithScore;
			});
			const matchesWithScore: TJourney = {
				jid: matches.jid,
				status: matchesDone.some(match => match.status === 'TODO') ? 'TODO' : 'DONE',
				value: matchesDone,
			};
			const currentJourney = season.fase.semifinal.currentJourney;
			const updatedJourneys = season.fase.semifinal.matches.matches.map(jry => {
				return jry.jid === matchesWithScore.jid ? matchesWithScore : jry;
			});
			const isFinished = !updatedJourneys.some(jourey => jourey.status === 'TODO');
			const winners = matchesWithScore.value.map(match => getWinner(match).winner);
			const seasonUpdated: TSeason = {
				...season,
				fase: {
					...season.fase,
					semifinal: {
						...season.fase.semifinal,
						currentJourney: isFinished ? currentJourney + 1 : currentJourney,
						status: !isFinished ? 'ACTIVE' : 'FINISHED',
						winners,
						matches: {
							...season.fase.regular.matches,
							matches: updatedJourneys,
						},
					},
				},
			};
			return {
				...state,
				seasons: setSeasons(seasonUpdated, state.seasons),
			};
		}
		case '[SEASSON-FINAL] - SET MATCHES': {
			const sid = action.payload;
			const season = state.seasons.find(season => season.uuid === sid) as TSeason;
			const winners =
				season.fase.semifinal?.winners?.map(club => {
					return {
						club,
						position: season.table.findIndex(item => item.club.uuid === club.uuid),
					};
				}) || [];
			const local = winners[0].position < winners[1].position ? winners[0].club : winners[1].club;
			const visitor = winners[0].position > winners[1].position ? winners[0].club : winners[1].club;
			const final: TJourney = {
				jid: getUuid(),
				status: 'TODO',
				value: [
					{
						uuid: getUuid(),
						status: 'TODO',
						local: {
							...local,
							score: 0,
						},
						visit: {
							...visitor,
							score: 0,
						},
					},
				],
			};
			const fase: TFase = {
				...season.fase.semifinal,
				status: 'ACTIVE',
				matches: {
					uuid: getUuid(),
					title: 'Final',
					matches: [final],
				},
			};
			const updatedSeason: TSeason = {
				...season,
				fase: {
					...season.fase,
					final: fase,
				},
			};

			return {
				...state,
				seasons: setSeasons(updatedSeason, state.seasons),
			};
		}
		case '[SEASSON-FINAL] - ADD MATCH SCORE': {
			const { uuid, matches } = action.payload as { uuid: string; matches: TJourney };
			const {
				season,
				isFinished,
				currentJourney,
				matches: matchesUpdated,
				winners,
			} = updateMatchesNoDraw({
				type: 'final',
				uuid,
				matches,
				seasons: state.seasons,
			});
			const seasonUpdated: TSeason = {
				...season,
				fase: {
					...season.fase,
					final: {
						...season.fase.final,
						currentJourney: isFinished ? currentJourney + 1 : currentJourney,
						status: !isFinished ? 'ACTIVE' : 'FINISHED',
						winners,
						matches: {
							...season.fase.regular.matches,
							matches: matchesUpdated,
						},
					},
				},
			};

			return {
				...state,
				seasons: setSeasons(seasonUpdated, state.seasons),
			};
		}
		default:
			return state;
	}
};

function getScoreNoDraw(matches: TJourney) {
	const matchesDone = matches.value.map(match => {
		let matchWithScore: TMatches;
		do {
			matchWithScore = getRandomScore(match);
		} while (matchWithScore.local.score === matchWithScore.visit.score);

		return matchWithScore;
	});

	return matchesDone;
}
type TParams = {
	type: 'regular' | 'semifinal' | 'final';
	uuid: string;
	matches: TJourney;
	seasons: TSeason[];
};

function updateMatchesNoDraw({ type, uuid, matches, seasons }: TParams) {
	const season = seasons.find(s => s.uuid === uuid) as TSeason;
	const matchesDone = getScoreNoDraw(matches);
	const matchesWithScore: TJourney = {
		jid: matches.jid,
		status: matchesDone.some(match => match.status === 'TODO') ? 'TODO' : 'DONE',
		value: matchesDone,
	};
	const currentJourney = season.fase[type].currentJourney;
	const updatedJourneys = season.fase[type].matches.matches.map(jry => {
		return jry.jid === matchesWithScore.jid ? matchesWithScore : jry;
	});
	const isFinished = !updatedJourneys.some(jourey => jourey.status === 'TODO');
	const winners = matchesWithScore.value.map(match => getWinner(match).winner);

	return {
		season,
		isFinished,
		currentJourney,
		winners,
		matches: updatedJourneys,
	};
}
