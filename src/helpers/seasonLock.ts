import { TSeason, TWorldCup } from '../store';
import { getUnplayedWorldCupCycle } from './worldCup';

export type TSeasonLock = 'SEASON_IN_PROGRESS' | 'WORLD_CUP_PENDING' | 'WORLD_CUP_IN_PROGRESS';

export const SEASON_LOCK_MESSAGE: Record<TSeasonLock, string> = {
	SEASON_IN_PROGRESS: 'Finish the current season first',
	WORLD_CUP_PENDING: 'Finish this season to play the World Cup',
	WORLD_CUP_IN_PROGRESS: 'Finish the World Cup first',
};

/**
 * Why a new season can't be created right now (null = it can). Only one
 * season can be played at a time, and none while a World Cup is pending or
 * being played.
 */
export const getSeasonLock = (seasons: TSeason[], worldCups: TWorldCup[]): TSeasonLock | null => {
	if (worldCups.some(wc => wc.isCurrent)) return 'WORLD_CUP_IN_PROGRESS';
	if (seasons.some(season => season.isCurrent)) return 'SEASON_IN_PROGRESS';
	if (getUnplayedWorldCupCycle(seasons, worldCups) !== undefined) return 'WORLD_CUP_PENDING';
	return null;
};
