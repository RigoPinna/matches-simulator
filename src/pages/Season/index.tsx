import { useNavigate } from 'react-router-dom';
import { useCurrentSeasonParams } from '../../hooks';
import { Main } from '../../components/layouts';
import { Button, Header, Table } from '../../components/ui';
import { ArrowLeft } from '../../components/icons';
import { StatusJourney } from './StatusJournay';
import { StatusSemifinals } from './StatusSemifinals';
import { Final } from './Final';
import styles from './styles.module.css';
import { Finished } from './Finished';

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
				<Final />
				<Finished />
			</Main>
		</>
	);
};
