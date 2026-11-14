import { CSSProperties, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { INTL_LEAGUES, LEAGUE_INFO, SeassonContext, TLeague } from '../../store';
import { Main } from '../../components/layouts';
import { Button, ClubBadge, Header, ItemClub, LeagueTabs, TTabOption } from '../../components/ui';
import { ArrowLeft } from '../../components/icons';
import {
	TAB_TROPHIES,
	THistoryEntry,
	TTrophyKind,
	TWinnersTab,
	getTabClubs,
	getTitleHistory,
	getTrophyRanking,
} from '../../helpers';
import leagueTrophy from '../../assets/champion.png';
import supercupTrophy from '../../assets/supercup.png';
import worldCupTrophy from '../../assets/wp-thropy.png';
import styles from './styles.module.css';

const TROPHY_IMAGE: Record<TTrophyKind, string> = {
	LEAGUE: leagueTrophy,
	SUPERCUP: supercupTrophy,
	WORLD_CUP: worldCupTrophy,
};

const TABS: TTabOption<TWinnersTab>[] = [
	...(['PRIMERA', 'PLATE', ...INTL_LEAGUES] as TLeague[]).map(league => ({
		value: league,
		label: LEAGUE_INFO[league].short,
	})),
	{ value: 'WORLD_CUP', label: 'World Cup' },
];

const TrophyPill = ({ kind, count, label }: { kind: TTrophyKind; count: number; label: string }) => (
	<span
		className={`${styles.pill} ${count === 0 ? styles.pill_empty : ''}`}
		aria-label={`${count} ${label}`}>
		<img src={TROPHY_IMAGE[kind]} alt='' />
		{count}
	</span>
);

export const WinnersPage = () => {
	const navigate = useNavigate();
	const { seasons, worldCups, clubs, plateClubs, intlClubs } = useContext(SeassonContext);
	const [tab, setTab] = useState<TWinnersTab>('PRIMERA');

	const trophies = TAB_TROPHIES[tab];
	const ranking = useMemo(
		() => getTrophyRanking(tab, getTabClubs(tab, { clubs, plateClubs, intlClubs })),
		[tab, clubs, plateClubs, intlClubs],
	);
	const history = useMemo(() => getTitleHistory(tab, seasons, worldCups), [tab, seasons, worldCups]);
	const leader = ranking[0];
	const tabName = tab === 'WORLD_CUP' ? 'World Cup' : LEAGUE_INFO[tab].name;

	const renderHistoryEntry = (entry: THistoryEntry) => {
		const isWorldCup = tab === 'WORLD_CUP';
		return (
			<li
				key={entry.id}
				className={`${styles.history_row} ${entry.worldCupId ? styles.clickable : ''}`}
				onClick={entry.worldCupId ? () => navigate(`/world-cup/${entry.worldCupId}`) : undefined}>
				<div className={styles.history_head}>
					<h4>{entry.title}</h4>
					{entry.double && <span className={styles.double}>Double 🏆🏆</span>}
				</div>
				<div className={styles.history_winners}>
					<div className={styles.history_winner}>
						<img src={TROPHY_IMAGE[isWorldCup ? 'WORLD_CUP' : 'LEAGUE']} alt='' />
						<div>
							<span>{isWorldCup ? 'Champion' : 'League'}</span>
							<ItemClub {...entry.first} />
						</div>
					</div>
					{entry.second && !entry.double && (
						<div className={styles.history_winner}>
							{isWorldCup ? (
								<span className={styles.runner_up}>2nd</span>
							) : (
								<img src={TROPHY_IMAGE.SUPERCUP} alt='' />
							)}
							<div>
								<span>{isWorldCup ? 'Runner-up' : 'Supercup'}</span>
								<ItemClub {...entry.second} />
							</div>
						</div>
					)}
				</div>
			</li>
		);
	};

	return (
		<>
			<Header>
				<Button.Secondary onClick={() => navigate(-1)}>
					<ArrowLeft />
				</Button.Secondary>
				<h1>Winners</h1>
			</Header>
			<Main>
				<LeagueTabs value={tab} onChange={setTab} options={TABS} />

				{leader ? (
					<div
						className={styles.hero}
						style={{ '--club-color': leader.club.color } as CSSProperties}
						onClick={() => navigate(`/club/${leader.club.uuid}`)}>
						<ClubBadge className={styles.hero_crest} {...leader.club} />
						<div className={styles.hero_info}>
							<span>Most successful · {tabName}</span>
							<h2>{leader.club.name}</h2>
							<div className={styles.hero_trophies}>
								{trophies.map((t, i) => (
									<TrophyPill key={t.key} kind={t.kind} count={leader.counts[i]} label={t.label} />
								))}
							</div>
						</div>
						<img className={styles.hero_trophy} src={TROPHY_IMAGE[trophies[0].kind]} alt='' />
					</div>
				) : (
					<div className={styles.empty}>
						<img src={TROPHY_IMAGE[trophies[0].kind]} alt='' />
						<p>No champions yet in {tabName}</p>
					</div>
				)}

				{ranking.length > 0 && (
					<section className={styles.section}>
						<div className={styles.section_head}>
							<h3>Titles</h3>
							<div className={styles.legend}>
								{trophies.map(t => (
									<span key={t.key}>
										<img src={TROPHY_IMAGE[t.kind]} alt='' />
										{t.label}
									</span>
								))}
							</div>
						</div>
						<ul className={styles.card}>
							{ranking.map(row => (
								<li
									key={row.club.uuid}
									className={`${styles.rank_row} ${styles.clickable}`}
									onClick={() => navigate(`/club/${row.club.uuid}`)}>
									<span className={`${styles.position} ${row.position <= 3 ? styles[`podium_${row.position}`] : ''}`}>
										{row.position}
									</span>
									<ItemClub className={styles.rank_club} {...row.club} />
									<div className={styles.rank_trophies}>
										{trophies.map((t, i) => (
											<TrophyPill key={t.key} kind={t.kind} count={row.counts[i]} label={t.label} />
										))}
									</div>
								</li>
							))}
						</ul>
					</section>
				)}

				{history.length > 0 && (
					<section className={styles.section}>
						<div className={styles.section_head}>
							<h3>History</h3>
						</div>
						<ul className={styles.card}>{history.map(renderHistoryEntry)}</ul>
					</section>
				)}
			</Main>
		</>
	);
};
