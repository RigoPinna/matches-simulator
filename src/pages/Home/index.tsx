import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as getUuid } from 'uuid';
import { SeassonContext, TLeague } from '../../store';
import { Main } from '../../components/layouts';
import { Header, Button, ListSeassons, List, LeagueTabs } from '../../components/ui';
import { Ball, GameFilled, GameOutlined, Trophy } from '../../components/icons';

import styles from './styles.module.css';

export const HomaPage = () => {
	const { seasons, dispatch } = useContext(SeassonContext);
	const navigate = useNavigate();
	const [league, setLeague] = useState<TLeague>('PRIMERA');

	const handleCreateNewSeason = () => {
		const uuid = getUuid();
		dispatch({
			type: '[SEASSON] - NEW SEASSON',
			payload: uuid,
		});
		navigate(`/seasson/${uuid}`);
	};

	return (
		<>
			<Header className={styles.home_header}>
				<h1>Seasons</h1>
				{seasons.length > 0 && (
					<Button.Primary onClick={handleCreateNewSeason}>
						<GameFilled />
						New Seasson
					</Button.Primary>
				)}
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
						</List.Container>
						<LeagueTabs value={league} onChange={setLeague} />
						<ListSeassons league={league} />
					</>
				)}
			</Main>
		</>
	);
};
