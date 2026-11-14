import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Filter } from '../../components/icons';
import { Main } from '../../components/layouts';
import { BottomSheet, Button, ClubBadge, Header, LastMatches } from '../../components/ui';
import { useCallback, useContext, useMemo, useState } from 'react';
import { SeassonContext } from '../../store';
import {
	DEFAULT_CLUB_MATCH_FILTERS,
	TClubMatchFilters,
	filterClubMatches,
	getClubMatches,
	getOpponents,
} from '../../helpers';
import { useModal } from '../../hooks';
import lige from '../../assets/champion.png';
import supercup from '../../assets/supercup.png';
import worldCupTrophy from '../../assets/wp-thropy.png';
import { ClubMatchList } from './ClubMatchList';
import { MatchFilters } from './MatchFilters';
import styles from './styles.module.css';
import matchStyles from './matches.module.css';
export const ClubPage = () => {
	const navigate = useNavigate();
	const { cid } = useParams();
	const { clubs, plateClubs, intlClubs, seasons, worldCups } = useContext(SeassonContext);
	const filtersSheet = useModal(false);
	const [filters, setFilters] = useState<TClubMatchFilters>(DEFAULT_CLUB_MATCH_FILTERS);
	const resetFilters = useCallback(() => setFilters(DEFAULT_CLUB_MATCH_FILTERS), []);

	// Every played match (league, supercup and World Cup), newest first.
	const allMatches = useMemo(
		() => getClubMatches(cid || '', seasons, worldCups),
		[cid, seasons, worldCups],
	);
	const opponents = useMemo(() => getOpponents(allMatches), [allMatches]);
	const filteredMatches = useMemo(
		() => filterClubMatches(allMatches, filters),
		[allMatches, filters],
	);
	const activeFilters = (Object.keys(filters) as (keyof TClubMatchFilters)[]).filter(
		key => filters[key] !== 'ALL',
	).length;
	const statistics = useMemo(() => {
		const wins = allMatches.filter(m => m.result === 'WIN').length;
		const draws = allMatches.filter(m => m.result === 'DRAW').length;
		const losses = allMatches.length - wins - draws;
		return {
			wins,
			draws,
			losses,
			winPercentage: allMatches.length ? (wins / allMatches.length) * 100 : 0,
		};
	}, [allMatches]);

	const club = [...clubs, ...plateClubs, ...Object.values(intlClubs).flat()].find(
		({ uuid }) => uuid === cid,
	);

	if (!club) {
		return <div>Club not found</div>;
	}
	const clubSeasonsHistory = seasons
		.filter(season => season.table.some(item => item.club.uuid === cid))
		.sort((a, b) => a.number - b.number);
	const lastClubSeason = clubSeasonsHistory[clubSeasonsHistory.length - 1];
	return (
		<>
			<Header>
				<Button.Secondary onClick={() => navigate(-1)}>
					<ArrowLeft />
					Back
				</Button.Secondary>
				<h1>Club</h1>
			</Header>
			<Main>
				<div className={styles.header}>
					<ClubBadge
						className={styles.club_image}
						uuid={club.uuid}
						image={club?.image}
						name={club?.name || ''}
						color={club?.color}
					/>
					<h2>{club?.name}</h2>
					<LastMatches showtitles clubId={club.uuid} seasonId={lastClubSeason?.uuid || ''} />
				</div>
				<div className={styles.statistics}>
					<ul className={styles.list}>
						<li className={styles.list_item}>
							<p className={styles.number_trophy}>{club.champions}</p>
							<h3 className={styles.title}>Leagues</h3>
							<img src={lige} alt='champion' className={styles.champ} />
						</li>
						<li className={styles.list_item}>
							<p className={styles.number_trophy}>{club.supercups}</p>
							<h3 className={styles.title}>Supercups</h3>
							<img src={supercup} alt='champion' className={styles.champ} />
						</li>
						{!!club.worldCups && (
							<li className={styles.list_item}>
								<p className={styles.number_trophy}>{club.worldCups}</p>
								<h3 className={styles.title}>World Cups</h3>
								<img
									src={worldCupTrophy}
									alt='world cup'
									className={`${styles.champ} ${styles.champ_w}`}
								/>
							</li>
						)}
						<li className={styles.list_item}>
							<p className={styles.number_trophy}>
								{statistics.winPercentage.toFixed(1)}
								<span>%</span>
							</p>
							<div className={styles.statistic_wrapper}>
								<div className={styles.statistic}>
									<p>{statistics.wins}</p>W
								</div>
								<div className={styles.statistic}>
									<p>{statistics.draws}</p>D
								</div>
								<div className={styles.statistic}>
									<p>{statistics.losses}</p>L
								</div>
							</div>
							<h3 className={styles.title}>Winning percentage</h3>
						</li>
					</ul>
				</div>
				<div className={matchStyles.matches_header}>
					<h3>
						All matches
						<span>{filteredMatches.length}</span>
					</h3>
					<Button.Primary className={matchStyles.filter_btn} onClick={filtersSheet.onOpen}>
						<Filter />
						Filter by
						{activeFilters > 0 && <span className={matchStyles.filter_count}>{activeFilters}</span>}
					</Button.Primary>
				</div>
				<ClubMatchList
					cid={club.uuid}
					matches={filteredMatches}
					hasFilters={activeFilters > 0}
					onReset={resetFilters}
				/>
				<BottomSheet
					isOpen={filtersSheet.isOpen}
					onClose={filtersSheet.onClose}
					title='Filters'
					footer={
						<>
							<Button.Secondary className={matchStyles.sheet_reset} onClick={resetFilters}>
								Reset
							</Button.Secondary>
							<Button.Primary className={matchStyles.sheet_apply} onClick={filtersSheet.onClose}>
								Show {filteredMatches.length} matches
							</Button.Primary>
						</>
					}>
					<MatchFilters filters={filters} onChange={setFilters} opponents={opponents} />
				</BottomSheet>
			</Main>
		</>
	);
};
