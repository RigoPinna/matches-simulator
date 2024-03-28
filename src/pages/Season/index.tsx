import { useNavigate, useParams } from 'react-router-dom';
import { Main } from '../../components/layouts';
import { Button, Header, MatchList } from '../../components/ui';
import { Table } from '../../components/ui/Table';
import { useContext, useMemo } from 'react';
import { SeassonContext } from '../../store';
import { ArrowLeft } from '../../components/icons';

export const SeasonPage = () => {
	const { seasons } = useContext(SeassonContext);
	const navigate = useNavigate();
	const { sid } = useParams();

	const season = useMemo(() => seasons.find(({ uuid }) => uuid === sid), [seasons, sid]);
	const table = useMemo(() => {
		//TODO: Add the function to order the table by GD(Goals Difference), this function only order by Pts
		if (season?.table) {
			return season?.table.sort((a, b) => {
				return a.pts - b.pts;
			});
		}
		return [];
	}, [season?.table]);
	console.log(season?.fase);
	return (
		<>
			<Header>
				<Button.Secondary onClick={() => navigate(-1)}>
					<ArrowLeft />
				</Button.Secondary>
				<h1>Season {season?.number}</h1>
			</Header>
			<Main>
				<Table table={table} />
				{season?.fase.regular.matches.matches.map((journey, i) => (
					<MatchList
						key={`jy=${i}`}
						title={`Journey ${i + 1} of ${season.fase.regular.matches.matches.length}`}
						matches={journey}
						isCurrent={season.fase.regular.currentJourney === i + 1}
					/>
				))}
			</Main>
		</>
	);
};
