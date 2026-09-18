import { useNavigate } from 'react-router-dom';
import { useCurrentSeasonParams } from '../../hooks';
import { Main } from '../../components/layouts';
import { Button, ClubBadge, Header, Table } from '../../components/ui';
import { ArrowLeft } from '../../components/icons';
import { StatusJourney } from './StatusJournay';
import { StatusSemifinals } from './StatusSemifinals';
import { Final } from './Final';
import styles from './styles.module.css';
import { Finished } from './Finished';
import { SeassonContext } from '../../store';
import { aggregateTable, getCycleRange } from '../../helpers';
import { useContext, useMemo, useState } from 'react';

export const SeasonPage = () => {
	const navigate = useNavigate();
	const { season } = useCurrentSeasonParams();
	const { seasons } = useContext(SeassonContext);
	const [view, setView] = useState<'season' | 'total'>('season');
	const totalTable = useMemo(() => {
		if (typeof season === 'undefined') return [];
		return aggregateTable(seasons, season.league, season.number);
	}, [seasons, season?.league, season?.number]);
	if (typeof season === 'undefined') {
		return <></>;
	}
	const [cycleStart, cycleEnd] = getCycleRange(season.number);
	const relegationHint =
		season.league === 'PRIMERA'
			? 'Last place gets relegated to Plate Ligue'
			: 'First place gets promoted to Primera División';
	const getLastWinner = () => {
		const leagueSeasons = seasons
			.filter(s => s.league === season.league)
			.sort((a, b) => a.number - b.number);
		const currentIndex = leagueSeasons.findIndex(s => s.uuid === season.uuid);
		const lastSeason = currentIndex > 0 ? leagueSeasons[currentIndex - 1] : undefined;
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
				<h1>{season.league === 'PLATE' ? 'Plate Ligue' : 'Season'} {season.number}</h1>
				<div className={styles.last_winner}>
					{lastWinner && (
						<>
							<ClubBadge image={lastWinner.club.image} name={lastWinner.club.name} color={lastWinner.club.color} />
							<span>Last winner</span>
						</>
					)}
				</div>
			</Header>
			<div className={styles.container_table}>
				<div className={styles.wrapper_table}>
					<div className={styles.table_tabs}>
						<button
							className={`${styles.table_tab} ${view === 'season' ? styles.table_tab_active : ''}`}
							onClick={() => setView('season')}>
							Season {season.number}
						</button>
						<button
							className={`${styles.table_tab} ${view === 'total' ? styles.table_tab_active : ''}`}
							onClick={() => setView('total')}>
							Total {cycleStart}-{cycleEnd}
						</button>
					</div>
					{view === 'total' && <p className={styles.table_hint}>{relegationHint}</p>}
					<Table table={(view === 'season' ? season.table : totalTable) || []} />
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
