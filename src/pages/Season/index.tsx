import { Main } from '../../components/layouts';
import { Header, MatchList } from '../../components/ui';
import { Table } from '../../components/ui/Table';

export const SeasonPage = () => {
	return (
		<>
			<Header>
				<h1>Temporada 1</h1>
			</Header>
			<Main>
				<Table />
				<MatchList />
			</Main>
		</>
	);
};
