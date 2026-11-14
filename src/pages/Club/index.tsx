import { useNavigate, useParams } from 'react-router-dom';
import { useCallback, useContext, useMemo, useState } from 'react';
import { ArrowLeft, Filter } from '../../components/icons';
import { Main } from '../../components/layouts';
import { BottomSheet, Button, Header } from '../../components/ui';
import { SeassonContext } from '../../store';
import {
	DEFAULT_CLUB_MATCH_FILTERS,
	TClubMatchFilters,
	filterClubMatches,
	getClubMatches,
	getClubSeasonHistory,
	getClubStats,
	getNextMatch,
	getOpponents,
} from '../../helpers';
import { useModal, useWorldCupChampionUuid } from '../../hooks';
import { ClubHero } from './ClubHero';
import { ClubTrophies } from './ClubTrophies';
import { ClubStats, HeadToHead } from './ClubStats';
import { SeasonHistory } from './SeasonHistory';
import { ClubMatchList } from './ClubMatchList';
import { MatchFilters } from './MatchFilters';
import matchStyles from './matches.module.css';

const FORM_SIZE = 5;

export const ClubPage = () => {
	const navigate = useNavigate();
	const { cid = '' } = useParams();
	const { clubs, plateClubs, intlClubs, seasons, worldCups } = useContext(SeassonContext);
	const championUuid = useWorldCupChampionUuid();
	const filtersSheet = useModal(false);
	const [filters, setFilters] = useState<TClubMatchFilters>(DEFAULT_CLUB_MATCH_FILTERS);
	const resetFilters = useCallback(() => setFilters(DEFAULT_CLUB_MATCH_FILTERS), []);

	// Every played match (league, supercup and World Cup), newest first.
	const allMatches = useMemo(() => getClubMatches(cid, seasons, worldCups), [cid, seasons, worldCups]);
	const stats = useMemo(() => getClubStats(allMatches), [allMatches]);
	const history = useMemo(() => getClubSeasonHistory(cid, seasons), [cid, seasons]);
	const next = useMemo(() => getNextMatch(cid, seasons, worldCups), [cid, seasons, worldCups]);
	const opponents = useMemo(() => getOpponents(allMatches), [allMatches]);
	const filteredMatches = useMemo(() => filterClubMatches(allMatches, filters), [allMatches, filters]);
	const headToHead = useMemo(() => {
		if (filters.opponent === 'ALL') return undefined;
		const opponent = opponents.find(o => o.club.uuid === filters.opponent)?.club;
		if (!opponent) return undefined;
		return { opponent, stats: getClubStats(allMatches.filter(m => m.opponent.uuid === opponent.uuid)) };
	}, [filters.opponent, opponents, allMatches]);
	const activeFilters = (Object.keys(filters) as (keyof TClubMatchFilters)[]).filter(
		key => filters[key] !== 'ALL',
	).length;

	const mexicanClubs = [...clubs, ...plateClubs];
	const club = [...mexicanClubs, ...Object.values(intlClubs).flat()].find(({ uuid }) => uuid === cid);
	if (!club) {
		return <div>Club not found</div>;
	}
	const isMexican = mexicanClubs.some(c => c.uuid === club.uuid);
	const showPlate =
		history.some(row => row.league === 'PLATE') || !!club.plateChampions || !!club.plateSupercups;
	// Oldest → newest, so the latest result sits on the right.
	const form = allMatches.slice(0, FORM_SIZE).map(m => m.result).reverse();

	return (
		<>
			<Header>
				<Button.Secondary onClick={() => navigate(-1)}>
					<ArrowLeft />
				</Button.Secondary>
				<h1>Club</h1>
			</Header>
			<Main>
				<ClubHero
					club={club}
					latest={history[0]}
					form={form}
					next={next}
					isWorldCupChampion={club.uuid === championUuid}
				/>
				<ClubTrophies club={club} isMexican={isMexican} showPlate={showPlate} />

				{stats.played > 0 && <ClubStats stats={stats} />}
				<SeasonHistory rows={history} />

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
				{headToHead && <HeadToHead opponent={headToHead.opponent} stats={headToHead.stats} />}
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
