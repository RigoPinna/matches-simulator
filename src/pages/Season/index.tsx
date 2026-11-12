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
import {
	LEAGUE_INFO,
	QUALIFIERS_PER_LEAGUE,
	SEASONS_PER_WORLD_CUP,
	SeassonContext,
	WORLD_CUP_LEAGUES,
	isReadOnlyLeague,
} from '../../store';
import { aggregateTable, aggregateWorldCupTable, getCycleRange } from '../../helpers';
import { useContext, useMemo, useState } from 'react';

type TTableView = 'season' | 'total' | 'worldCup';

export const SeasonPage = () => {
	const navigate = useNavigate();
	const { season } = useCurrentSeasonParams();
	const { seasons } = useContext(SeassonContext);
	const [view, setView] = useState<TTableView>('season');
	const totalTable = useMemo(() => {
		if (typeof season === 'undefined') return [];
		return aggregateTable(seasons, season.league, season.number);
	}, [seasons, season?.league, season?.number]);
	const worldCupTable = useMemo(() => {
		if (typeof season === 'undefined' || !season.wcCycle) return [];
		return aggregateWorldCupTable(seasons, season.league, season.wcCycle);
	}, [seasons, season?.league, season?.wcCycle]);
	if (typeof season === 'undefined') {
		return <></>;
	}
	const [cycleStart, cycleEnd] = getCycleRange(season.number);
	const hasPromotion = season.league === 'PRIMERA' || season.league === 'PLATE';
	const hasWorldCup = WORLD_CUP_LEAGUES.includes(season.league) && !!season.wcCycle;
	const relegationHint =
		season.league === 'PRIMERA'
			? 'Last place gets relegated to Plate Ligue'
			: 'First place gets promoted to Primera División';
	const worldCupHint = `Top ${QUALIFIERS_PER_LEAGUE} qualify for World Cup ${season.wcCycle} · season ${season.wcCycleSeason} of ${SEASONS_PER_WORLD_CUP}`;
	const tables = {
		season: season.table,
		total: totalTable,
		worldCup: worldCupTable,
	};
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
	};
	const lastWinner = getLastWinner();
	const title = season.league === 'PRIMERA' ? 'Season' : LEAGUE_INFO[season.league].short;
	return (
		<>
			<Header>
				<Button.Secondary onClick={() => navigate(-1)}>
					<ArrowLeft />
				</Button.Secondary>
				<h1>
					{title} {season.number}
				</h1>
				<div className={styles.last_winner}>
					{lastWinner && (
						<>
							<ClubBadge
								image={lastWinner.club.image}
								name={lastWinner.club.name}
								color={lastWinner.club.color}
							/>
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
						{hasPromotion && (
							<button
								className={`${styles.table_tab} ${view === 'total' ? styles.table_tab_active : ''}`}
								onClick={() => setView('total')}>
								Total {cycleStart}-{cycleEnd}
							</button>
						)}
						{hasWorldCup && (
							<button
								className={`${styles.table_tab} ${view === 'worldCup' ? styles.table_tab_active : ''}`}
								onClick={() => setView('worldCup')}>
								World Cup 🏆
							</button>
						)}
					</div>
					{view === 'total' && <p className={styles.table_hint}>{relegationHint}</p>}
					{view === 'worldCup' && <p className={styles.table_hint}>{worldCupHint}</p>}
					{isReadOnlyLeague(season.league) && view === 'season' && (
						<p className={styles.table_hint}>Simulated alongside your league</p>
					)}
					<Table table={tables[view] || []} />
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
