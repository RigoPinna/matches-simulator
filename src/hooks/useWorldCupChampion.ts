import { useContext, useMemo } from 'react';
import { SeassonContext } from '../store';
import { TChampionTitle, getChampionTitles, getChampions, getLastWorldCupChampion } from '../helpers';

/** uuid of the defending World Cup champion, if a World Cup has been played. */
export const useWorldCupChampionUuid = (): string | undefined => {
	const { worldCups } = useContext(SeassonContext);
	return useMemo(() => getLastWorldCupChampion(worldCups)?.uuid, [worldCups]);
};

/** Titles a club currently holds (World Cup, league), most important first. */
export const useChampionTitles = (uuid?: string): TChampionTitle[] => {
	const { seasons, worldCups } = useContext(SeassonContext);
	const champions = useMemo(() => getChampions(seasons, worldCups), [seasons, worldCups]);
	return useMemo(() => (uuid ? getChampionTitles(uuid, champions) : []), [uuid, champions]);
};
