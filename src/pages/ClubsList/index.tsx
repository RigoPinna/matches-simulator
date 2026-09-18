import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from '../../components/icons';
import { Main } from '../../components/layouts';
import { Button, Header, ItemClub, LeagueTabs, List } from '../../components/ui';
import styles from './styles.module.css';
import { useContext, useState } from 'react';
import { SeassonContext, TLeague } from '../../store';
export const ClubsListPage = () => {
	const navigate = useNavigate();
	const { clubs, plateClubs } = useContext(SeassonContext);
	const [league, setLeague] = useState<TLeague>('PRIMERA');
	const clubsByLeague = league === 'PRIMERA' ? clubs : plateClubs;
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
				<LeagueTabs value={league} onChange={setLeague} />
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
