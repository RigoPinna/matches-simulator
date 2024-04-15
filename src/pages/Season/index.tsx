import { Main } from '../../components/layouts';
import { Button, Header } from '../../components/ui';
import { Table } from '../../components/ui/Table';
import { ArrowLeft } from '../../components/icons';
import styles from './styles.module.css';
import { useNavigate } from 'react-router-dom';
import { useCurrentSeasonParams } from '../../hooks';
import { StatusJourney } from './StatusJournay';
import { StatusSemifinals } from './StatusSemifinals';

export const SeasonPage = () => {
	const navigate = useNavigate();
	const season = useCurrentSeasonParams();

	if (typeof season === 'undefined') {
		return <></>;
	}

	return (
		<>
			<Header>
				<Button.Secondary onClick={() => navigate(-1)}>
					<ArrowLeft />
				</Button.Secondary>
				<h1>Season {season.number}</h1>
			</Header>
			<div className={styles.container_table}>
				<div className={styles.wrapper_table}>
					<Table table={season.table || []} />
				</div>
			</div>
			<Main>
				<StatusJourney />
				<StatusSemifinals />
			</Main>
		</>
	);
};
