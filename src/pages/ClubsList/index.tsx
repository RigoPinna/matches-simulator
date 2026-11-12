import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from '../../components/icons';
import { Main } from '../../components/layouts';
import { Button, Header, ItemClub, LeagueTabs, List } from '../../components/ui';
import styles from './styles.module.css';
import { useContext, useState } from 'react';
import { INTL_LEAGUES, LEAGUE_INFO, SeassonContext, TLeague, isIntlLeague } from '../../store';

const LEAGUE_TABS = (['PRIMERA', 'PLATE', ...INTL_LEAGUES] as TLeague[]).map(league => ({
	value: league,
	label: LEAGUE_INFO[league].short,
}));
export const ClubsListPage = () => {
	const navigate = useNavigate();
	const { clubs, plateClubs, intlClubs } = useContext(SeassonContext);
	const [league, setLeague] = useState<TLeague>('PRIMERA');
	const clubsByLeague = isIntlLeague(league)
		? intlClubs[league]
		: league === 'PRIMERA'
			? clubs
			: plateClubs;
	return (
		<>
			<Header>
				<Button.Secondary
					onClick={() => {
						navigate('/');
					}}>
					<ArrowLeft />
					Back
				</Button.Secondary>
				<h1 className={styles.title_header}>Clubs</h1>
			</Header>
			<Main>
				<LeagueTabs value={league} onChange={setLeague} options={LEAGUE_TABS} />
				<List.Container title='All clubs'>
					{clubsByLeague.map(club => (
						<List.Item key={club.uuid} onClick={() => navigate(`/club/${club.uuid}`)}>
							<ItemClub {...club} />
						</List.Item>
					))}
				</List.Container>
			</Main>
		</>
	);
};
