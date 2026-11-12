import { useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as getUuid } from 'uuid';
import {
	INTL_LEAGUES,
	LEAGUE_INFO,
	SEASONS_PER_WORLD_CUP,
	SeassonContext,
	TLeague,
} from '../../store';
import { getCurrentWorldCup } from '../../store/WorldCup/worldCupReducer';
import { getUnplayedWorldCupCycle } from '../../helpers';
import { Main } from '../../components/layouts';
import {
	Header,
	Button,
	ListSeassons,
	List,
	LeagueTabs,
	TTabOption,
	ItemClub,
} from '../../components/ui';
import { Ball, GameFilled, GameOutlined, Trophy } from '../../components/icons';
import { STAGE_LABEL } from '../WorldCup/constants';

import worldCupTrophy from '../../assets/wp-thropy.png';
import styles from './styles.module.css';

/** World Cup trophy in a black, gold-bordered square (as in the Figma). */
const WorldCupBadge = () => (
	<span className={`${styles.badge} ${styles.badge_wc}`}>
		<img src={worldCupTrophy} alt='World Cup' />
	</span>
);

type THomeTab = TLeague | 'WORLD_CUP';
const HOME_TABS: TTabOption<THomeTab>[] = [
	...(['PRIMERA', 'PLATE', ...INTL_LEAGUES] as TLeague[]).map(league => ({
		value: league,
		label: LEAGUE_INFO[league].short,
	})),
	{ value: 'WORLD_CUP', label: 'World Cup' },
];

export const HomaPage = () => {
	const { seasons, worldCups, dispatch } = useContext(SeassonContext);
	const navigate = useNavigate();
	const [tab, setTab] = useState<THomeTab>('PRIMERA');

	const currentWorldCup = getCurrentWorldCup(worldCups);
	const unplayedCycle = getUnplayedWorldCupCycle(seasons, worldCups);
	// Latest season that is part of a World Cup cycle, to show the progress.
	const latestCycleSeason = useMemo(
		() =>
			seasons
				.filter(s => s.league === INTL_LEAGUES[0] && s.wcCycle)
				.sort((a, b) => b.number - a.number)[0],
		[seasons],
	);
	const worldCupHistory = useMemo(() => [...worldCups].reverse(), [worldCups]);

	const handleCreateNewSeason = () => {
		const uuid = getUuid();
		dispatch({
			type: '[SEASSON] - NEW SEASSON',
			payload: uuid,
		});
		navigate(`/seasson/${uuid}`);
	};
	const goToWorldCup = (wid: string) => navigate(`/world-cup/${wid}`);

	const renderHeaderAction = () => {
		if (seasons.length === 0) return null;
		if (currentWorldCup) {
			return (
				<Button.Primary onClick={() => goToWorldCup(currentWorldCup.uuid)}>
					<Trophy />
					World Cup
				</Button.Primary>
			);
		}
		// The last season of the cycle is still being played.
		if (unplayedCycle !== undefined) return null;
		return (
			<Button.Primary onClick={handleCreateNewSeason}>
				<GameFilled />
				New Seasson
			</Button.Primary>
		);
	};

	/** "World Cup" entry of the main list: current stage, or progress towards the next one. */
	const renderWorldCupItem = () => {
		const step = latestCycleSeason?.wcCycleSeason;
		let subtitle: string | null = null;
		if (currentWorldCup) {
			subtitle = `World Cup ${currentWorldCup.number} · ${STAGE_LABEL[currentWorldCup.stage]} 🔥`;
		} else if (unplayedCycle !== undefined) {
			subtitle = 'Finish this season to play the World Cup';
		} else if (step) {
			subtitle = `Next in ${SEASONS_PER_WORLD_CUP - step + 1} season(s) · season ${step} of ${SEASONS_PER_WORLD_CUP}`;
		}
		const onClick = () => {
			if (currentWorldCup) {
				goToWorldCup(currentWorldCup.uuid);
			} else {
				setTab('WORLD_CUP');
			}
		};
		return (
			<List.Item className={styles.winner_item} onClick={onClick}>
				<WorldCupBadge />
				<div className={styles.winner_info}>
					<h4>World Cup</h4>
					{subtitle && <p className={currentWorldCup ? styles.wc_current : ''}>{subtitle}</p>}
					{!currentWorldCup && step && (
						<div className={styles.wc_road_steps}>
							{Array.from({ length: SEASONS_PER_WORLD_CUP }, (_, i) => (
								<span
									key={i}
									className={`${styles.wc_road_step} ${i < step ? styles.wc_road_step_done : ''}`}
								/>
							))}
						</div>
					)}
				</div>
			</List.Item>
		);
	};

	return (
		<>
			<Header className={styles.home_header}>
				<h1>Seasons</h1>
				{renderHeaderAction()}
			</Header>
			<Main>
				{seasons.length === 0 ? (
					<div className={styles.container_empty}>
						<GameOutlined />
						<h3>You don’t have seasons yet...</h3>
						<Button.Primary className={styles.btn_create_season} onClick={handleCreateNewSeason}>
							Create Seasson
						</Button.Primary>
					</div>
				) : (
					<>
						<List.Container className={styles.winners_btn}>
							<List.Item className={styles.winner_item} onClick={() => navigate(`/clubs`)}>
								<span className={`${styles.badge} ${styles.badge_clubs}`}>
									<Ball />
								</span>
								<div className={styles.winner_info}>
									<h4>Clubs</h4>
								</div>
							</List.Item>
							<List.Item className={styles.winner_item} onClick={() => navigate(`/winners`)}>
								<span className={styles.badge}>
									<Trophy />
								</span>
								<div className={styles.winner_info}>
									<h4>Winners</h4>
								</div>
							</List.Item>
							{renderWorldCupItem()}
						</List.Container>
						<LeagueTabs value={tab} onChange={setTab} options={HOME_TABS} />
						{tab === 'WORLD_CUP' ? (
							<List.Container title='World Cups:'>
								{worldCupHistory.length === 0 && (
									<p className={styles.wc_empty}>
										The top 4 of each league after {SEASONS_PER_WORLD_CUP} seasons qualify.
									</p>
								)}
								{worldCupHistory.map(wc => (
									<List.Item
										key={wc.uuid}
										className={styles.winner_item}
										onClick={() => goToWorldCup(wc.uuid)}>
										<WorldCupBadge />
										<div className={styles.winner_info}>
											<h4>World Cup {wc.number}</h4>
											{wc.champion ? (
												<div className={styles.wc_champion}>
													<ItemClub {...wc.champion} /> 🏆
												</div>
											) : (
												<p className={styles.wc_current}>{STAGE_LABEL[wc.stage]} 🔥</p>
											)}
										</div>
									</List.Item>
								))}
							</List.Container>
						) : (
							<ListSeassons league={tab} />
						)}
					</>
				)}
			</Main>
		</>
	);
};
