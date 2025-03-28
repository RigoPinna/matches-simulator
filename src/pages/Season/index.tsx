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
import { SeassonContext } from '../../store';
import { useContext } from 'react';

export const SeasonPage = () => {
	const navigate = useNavigate();
	const { season } = useCurrentSeasonParams();
	const { seasons } = useContext(SeassonContext);
	if (typeof season === 'undefined') {
		return <></>;
	}
	const getLastWinner = () => {
		const lastSeason = seasons[seasons.length - 2];
		if (lastSeason && lastSeason.winner) {
			return lastSeason.table[0];
		}
		return null;
	}
	const lastWinner = getLastWinner();
	return (
		<>
			<Header>
				<Button.Secondary onClick={() => navigate(-1)}>
					<ArrowLeft />
				</Button.Secondary>
				<h1>Season {season.number}</h1>
				<div className={styles.last_winner}>
					{lastWinner && (
						<>
							<img src={lastWinner.club.image} alt={lastWinner.club.name} />
							<span>Last winner</span>
						</>
					)}
				</div>
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
