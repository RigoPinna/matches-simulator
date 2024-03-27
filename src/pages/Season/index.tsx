import { useParams } from 'react-router-dom';
import { Main } from '../../components/layouts';
import { Header, MatchList } from '../../components/ui';
import { Table } from '../../components/ui/Table';
import { useContext, useMemo } from 'react';
import { SeassonContext } from '../../store';

export const SeasonPage = () => {
	const { seasons } = useContext(SeassonContext);
	const { sid } = useParams();

	const currentSeasson = useMemo(() => seasons.find(({ uuid }) => uuid === sid), [seasons, sid]);
	const table = useMemo(() => {
		//TODO: Add the function to order the table by GD(Goals Difference), this function only order by Pts
		if (currentSeasson?.table) {
			return currentSeasson?.table.sort((a, b) => {
				return a.pts - b.pts;
			});
		}
		return [];
	}, [currentSeasson?.table]);
	return (
		<>
			<Header>
				<h1>Temporada 1</h1>
			</Header>
			<Main>
				<Table table={table} />
				<MatchList />
			</Main>
		</>
	);
};
