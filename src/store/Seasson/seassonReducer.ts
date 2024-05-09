import { v4 as getUuid } from 'uuid';
import {
	IClub,
	IItemTable,
	TFase,
	TJourney,
	TMatches,
	TSeason,
	TState,
	TStatusFase,
	globalState,
} from './SeassonContext';
import {
	getJourneys,
	getWinner,
	isMyClub,
	orderMyTeam,
	orderTable,
	setSeasons,
} from '../../helpers';
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
	| '[SEASSON] - FINISHED SEASON'
	| '[SEASSON] - ORDER TABLE'
	| '[SEASSON] - ADDED MY SCORE';

export type TAction = {
	type: TType;
	payload?: any;
};
export type TBlockedFase = {
	sid: string;
	type: 'regular' | 'semifinal' | 'final';
	status: TStatusFase;
};
export type TAddMyScore = {
	sid: string;
	jid: string;
	type: 'regular' | 'semifinal' | 'final';
	match: TMatches;
};
export type TSeasonReducer = (state: TState, action: TAction) => TState;

export const seassonReducer: TSeasonReducer = (state = globalState, action) => {
	switch (action.type) {
		case '[SEASSON] - SET SEASSONS': {
			const clubsSaved = localStorage.getItem('clubs');
			const clubs = clubsSaved ? JSON.parse(clubsSaved) : state.clubs;
			return {
				...state,
				clubs,
				seasons: action.payload,
			};
		}
		case '[SEASSON] - NEW SEASSON': {
			const uuid = action.payload;
			const newSeason: TSeason = {
				uuid: uuid,
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
							club: { ...club },
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
				winner: null,
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

			const matchesDone = matches.value.map(match => {
				return isMyClub(match, state.myClub as IClub) ? match : getRandomScore(match);
			});
			const matchesWithScore: TJourney = {
				jid: matches.jid,
				status: matchesDone.some(match => match.status === 'TODO') ? 'TODO' : 'DONE',
				value: matchesDone,
			};
			const tableOrded = orderTable(state.myClub as IClub, season.table, matchesWithScore);
			const currentJourney = season.fase.regular.currentJourney;
			const updatedJourneys = season.fase.regular.matches.matches.map(jry => {
				return jry.jid === matchesWithScore.jid ? matchesWithScore : jry;
			});
			const isActive = updatedJourneys.some(j => j.status === 'TODO');

			const seasonUpdated: TSeason = {
				...season,
				table: [...tableOrded],
				fase: {
					...season.fase,
					regular: {
						...season.fase.regular,
						currentJourney:
							matchesWithScore.status === 'DONE' ? currentJourney + 1 : currentJourney,
						status: isActive ? 'ACTIVE' : 'FINISHED',
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
			const winner = season.table[0].club;
			const newClubs =
				type === 'regular'
					? state.clubs.map(club =>
							winner.uuid === club.uuid
								? {
										...winner,
										champions: winner?.champions ? winner.champions + 1 : 1,
									}
								: club,
						)
					: state.clubs;

			localStorage.setItem('clubs', JSON.stringify(newClubs));

			return {
				...state,
				clubs: newClubs,
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
			const {
				season,
				isFinished,
				currentJourney,
				matches: matchesUpdated,
				winners,
			} = updateMatchesNoDraw({
				type: 'semifinal',
				uuid,
				matches,
				seasons: state.seasons,
				myClub: state.myClub as IClub,
			});
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
							...season.fase.semifinal.matches,
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
				...season.fase.final,
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
				myClub: state.myClub as IClub,
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
							...season.fase.final.matches,
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
		case '[SEASSON] - FINISHED SEASON': {
			const { sid, winner } = action.payload as { sid: string; winner: IClub };
			const season = state.seasons.find(s => s.uuid === sid) as TSeason;
			const clubs = state.clubs.map(item => {
				return item.uuid === winner.uuid
					? { ...winner, supercups: item?.supercups ? item.supercups + 1 : 1 }
					: item;
			});
			localStorage.setItem('clubs', JSON.stringify(clubs));
			return {
				...state,
				clubs,

				seasons: setSeasons(
					{
						...season,
						isCurrent: false,
						winner: season.fase.final?.winners ? season.fase.final.winners[0] : null,
					},
					state.seasons,
				),
			};
		}
		case '[SEASSON] - ADDED MY SCORE': {
			const { match: myMatch, sid, jid, type } = action.payload as TAddMyScore;
			const season = state.seasons.find(s => s.uuid === sid) as TSeason;
			const fase = season.fase[type];
			const journey = fase.matches.matches.find(journey => journey.jid === jid);
			const matches = journey?.value.map(match => (match.uuid === myMatch.uuid ? myMatch : match));
			const matchesDone: TMatches[] | undefined = matches?.map(match =>
				match.uuid === myMatch.uuid ? { ...myMatch, status: 'DONE' } : match,
			);
			const isDone = !matchesDone?.some(match => match.status === 'TODO');

			const newTable =
				type === 'regular'
					? orderMyTeam(state.myClub as IClub, season.table, {
							...journey,
							value: matches,
						} as TJourney)
					: season.table;
			const journeys = fase.matches.matches.map(journey =>
				journey.jid === jid
					? {
							...journey,
							status: isDone ? 'DONE' : 'TODO',
							value: matchesDone,
						}
					: journey,
			);
			let winners;
			if (type === 'semifinal' || type === 'final') {
				if (isDone && matchesDone) {
					winners = matchesDone.map(match => getWinner(match).winner);
				}
			}
			return {
				...state,
				seasons: setSeasons(
					{
						...season,
						table: [...newTable],
						fase: {
							...season.fase,

							[type]: {
								...fase,
								...((type === 'semifinal' || type === 'final') && {
									winners,
								}),
								status: journeys.some(item => item.status === 'TODO') ? 'ACTIVE' : 'FINISHED',
								currentJourney: isDone ? fase.currentJourney + 1 : fase.currentJourney,
								matches: {
									...fase.matches,
									matches: journeys,
								},
							} as TFase,
						},
					},
					state.seasons,
				),
			};
		}
		default:
			return state;
	}
};

function getScoreNoDraw(matches: TJourney, myClub: IClub) {
	const matchesDone = matches.value.map(match => {
		if (!isMyClub(match, myClub)) {
			let matchWithScore: TMatches;
			do {
				matchWithScore = getRandomScore(match);
			} while (matchWithScore.local.score === matchWithScore.visit.score);

			return matchWithScore;
		}
		return match;
	});

	return matchesDone;
}
type TParams = {
	type: 'regular' | 'semifinal' | 'final';
	uuid: string;
	matches: TJourney;
	seasons: TSeason[];
	myClub: IClub;
};

function updateMatchesNoDraw({ type, uuid, matches, seasons, myClub }: TParams) {
	const season = seasons.find(s => s.uuid === uuid) as TSeason;
	const matchesDone = getScoreNoDraw(matches, myClub);
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
