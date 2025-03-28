import { useContext, useMemo } from 'react';
import { SeassonContext } from '../store';
import { useParams } from 'react-router-dom';

export const useCurrentSeasonParams = () => {
	const { seasons } = useContext(SeassonContext);

	const { sid } = useParams();

	const season = useMemo(() => seasons.find(({ uuid }) => uuid === sid), [seasons, sid]);

	return {season, sid};
};
