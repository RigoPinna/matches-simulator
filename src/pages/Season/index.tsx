import { useNavigate } from 'react-router-dom';
import { useCurrentSeasonParams } from '../../hooks';
import { Main } from '../../components/layouts';
import { Button, Header, SegmentedControl, TSegment } from '../../components/ui';
import { ArrowLeft } from '../../components/icons';
import { StatusJourney } from './StatusJournay';
import { StatusSemifinals } from './StatusSemifinals';
import { Final } from './Final';
import styles from './styles.module.css';
import { Finished } from './Finished';
import { StandingsRace } from './StandingsRace';
import { SeasonStandings, TTableView } from './SeasonStandings';
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
	// The tabs replace the page title, so the season tab carries the league name.
	const seasonLabel = `${season.league === 'PRIMERA' ? 'Season' : LEAGUE_INFO[season.league].short} ${season.number}`;
	const tabs: TSegment<TTableView>[] = [
		{ value: 'season', label: seasonLabel },
		...(hasPromotion ? [{ value: 'total' as const, label: `Total ${cycleStart}-${cycleEnd}` }] : []),
		...(hasWorldCup ? [{ value: 'worldCup' as const, label: 'World Cup' }] : []),
	];
	const hints: Record<TTableView, string | undefined> = {
		season: isReadOnlyLeague(season.league) ? 'Simulated alongside your league' : undefined,
		total:
			season.league === 'PRIMERA'
				? 'Last place gets relegated to Plate Ligue'
				: 'First place gets promoted to Primera División',
		worldCup: `World Cup ${season.wcCycle} · season ${season.wcCycleSeason} of ${SEASONS_PER_WORLD_CUP} · top ${QUALIFIERS_PER_LEAGUE} qualify`,
	};
	const tables = {
		season: season.table,
		total: totalTable,
		worldCup: worldCupTable,
	};
	return (
		<>
			<Header className={styles.header}>
				<Button.Secondary onClick={() => navigate(-1)}>
					<ArrowLeft />
				</Button.Secondary>
				<div className={styles.header_tabs}>
					{tabs.length > 1 ? (
						<SegmentedControl label='Table' value={view} options={tabs} onChange={setView} />
					) : (
						<h1 className={styles.header_title}>{seasonLabel}</h1>
					)}
				</div>
			</Header>
			<SeasonStandings season={season} view={view} rows={tables[view] || []} hint={hints[view]} />
			<Main>
				{/* Replay of the table, journey by journey, once the regular season is over. */}
				{season.fase.regular.status !== 'ACTIVE' && <StandingsRace season={season} />}
				<StatusJourney />
				<StatusSemifinals />
				<Final />
				<Finished />
			</Main>
		</>
	);
};
