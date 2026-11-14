import { useContext, useMemo } from 'react';
import { SeassonContext } from '../store';
import { getLastWorldCupChampion } from '../helpers';

/** uuid of the defending World Cup champion, if a World Cup has been played. */
export const useWorldCupChampionUuid = (): string | undefined => {
	const { worldCups } = useContext(SeassonContext);
	return useMemo(() => getLastWorldCupChampion(worldCups)?.uuid, [worldCups]);
};
