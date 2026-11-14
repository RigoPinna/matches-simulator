import { useContext, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from '../../components/icons';
import { Main } from '../../components/layouts';
import { Button, ClubBadge, Header, LeagueTabs, SegmentedControl } from '../../components/ui';
import { INTL_LEAGUES, LEAGUE_INFO, SeassonContext, TLeague, isIntlLeague } from '../../store';
import { TAB_TROPHIES, TMatchResult, TTrophyKind, getClubMatches } from '../../helpers';
import leagueTrophy from '../../assets/champion.png';
import supercupTrophy from '../../assets/supercup.png';
import worldCupTrophy from '../../assets/wp-thropy.png';
import styles from './styles.module.css';

const LEAGUE_TABS = (['PRIMERA', 'PLATE', ...INTL_LEAGUES] as TLeague[]).map(league => ({
	value: league,
	label: LEAGUE_INFO[league].short,
}));

type TSort = 'TABLE' | 'TITLES' | 'NAME';
const SORT_OPTIONS: { value: TSort; label: string }[] = [
	{ value: 'TABLE', label: 'Standings' },
	{ value: 'TITLES', label: 'Titles' },
	{ value: 'NAME', label: 'A–Z' },
];

const TROPHY_IMAGE: Record<TTrophyKind, string> = {
	LEAGUE: leagueTrophy,
	SUPERCUP: supercupTrophy,
	WORLD_CUP: worldCupTrophy,
};
const FORM_CLASS: Record<TMatchResult, string> = {
	WIN: styles.form_win,
	DRAW: styles.form_draw,
	LOSS: styles.form_loss,
};
const FORM_SIZE = 5;

export const ClubsListPage = () => {
	const navigate = useNavigate();
	const { clubs, plateClubs, intlClubs, seasons, worldCups, myClub } = useContext(SeassonContext);
	const [league, setLeague] = useState<TLeague>('PRIMERA');
	const [sort, setSort] = useState<TSort>('TABLE');

	const roster = isIntlLeague(league) ? intlClubs[league] : league === 'PRIMERA' ? clubs : plateClubs;
	const trophies = TAB_TROPHIES[league];
	// Latest season of this league (the one in progress, or the last one played).
	const season = useMemo(
		() => seasons.filter(s => s.league === league).sort((a, b) => b.number - a.number)[0],
		[seasons, league],
	);

	const rows = useMemo(() => {
		const data = roster.map(club => {
			const index = season ? season.table.findIndex(row => row.club.uuid === club.uuid) : -1;
			// Oldest → newest, so the latest result sits on the right.
			const form = getClubMatches(club.uuid, seasons, worldCups)
				.slice(0, FORM_SIZE)
				.map(m => m.result)
				.reverse();
			return {
				club,
				position: index >= 0 ? index + 1 : undefined,
				pts: index >= 0 ? season!.table[index].pts : undefined,
				counts: trophies.map(t => club[t.key] || 0),
				form,
			};
		});
		const byPosition = (a: (typeof data)[number], b: (typeof data)[number]) =>
			(a.position ?? Infinity) - (b.position ?? Infinity) || a.club.name.localeCompare(b.club.name);
		return data.sort((a, b) => {
			if (sort === 'NAME') return a.club.name.localeCompare(b.club.name);
			if (sort === 'TITLES') {
				for (let i = 0; i < a.counts.length; i++) {
					if (a.counts[i] !== b.counts[i]) return b.counts[i] - a.counts[i];
				}
			}
			return byPosition(a, b);
		});
	}, [roster, season, seasons, worldCups, trophies, sort]);

	return (
		<>
			<Header>
				<Button.Secondary onClick={() => navigate(-1)}>
					<ArrowLeft />
				</Button.Secondary>
				<h1>Clubs</h1>
			</Header>
			<Main>
				<LeagueTabs value={league} onChange={setLeague} options={LEAGUE_TABS} />
				<SegmentedControl label='Sort clubs by' value={sort} options={SORT_OPTIONS} onChange={setSort} />

				<div className={styles.list_head}>
					<span>{roster.length} clubs</span>
					{season && (
						<span>
							{season.isCurrent ? 'Live · ' : ''}Season {season.number}
						</span>
					)}
				</div>

				<ul className={styles.card}>
					{rows.map(row => {
						const mine = row.club.uuid === myClub?.uuid;
						return (
							<li key={row.club.uuid}>
								<Link
									to={`/club/${row.club.uuid}`}
									className={`${styles.row} ${mine ? styles.row_mine : ''}`}>
									<span className={styles.position}>{row.position ?? '–'}</span>
									<ClubBadge className={styles.crest} {...row.club} />
									<div className={styles.info}>
										<p className={styles.name}>
											{row.club.name}
											{mine && (
												<span className={styles.star} aria-label='Your club'>
													★
												</span>
											)}
										</p>
										<p className={styles.meta}>
											{row.pts !== undefined ? `${row.pts} pts` : 'No matches yet'}
										</p>
									</div>
									<div className={styles.side}>
										<ol className={styles.form} aria-label='Last matches'>
											{Array.from({ length: FORM_SIZE }, (_, i) => {
												// Pad on the left so the newest result is always the last dot.
												const result = row.form[i - (FORM_SIZE - row.form.length)];
												return (
													<li
														key={i}
														className={`${styles.form_dot} ${result ? FORM_CLASS[result] : ''}`}
														aria-label={result ? result.toLowerCase() : 'not played'}
													/>
												);
											})}
										</ol>
										{row.counts.some(count => count > 0) && (
											<div className={styles.titles}>
												{trophies.map((t, i) =>
													row.counts[i] > 0 ? (
														<span key={t.key} className={styles.title_pill} aria-label={`${row.counts[i]} ${t.label}`}>
															<img src={TROPHY_IMAGE[t.kind]} alt='' />
															{row.counts[i]}
														</span>
													) : null,
												)}
											</div>
										)}
									</div>
									<span className={styles.chevron} aria-hidden='true'>
										<ArrowRight />
									</span>
								</Link>
							</li>
						);
					})}
				</ul>
			</Main>
		</>
	);
};
