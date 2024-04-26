import { useContext } from 'react';
import { v4 as getUuid } from 'uuid';
import { SeassonContext } from '../../store';
import { Main } from '../../components/layouts';
import { Header, Button, ListSeassons, List } from '../../components/ui';
import { GameFilled, GameOutlined, Trophy } from '../../components/icons';
import styles from './styles.module.css';
import { useNavigate } from 'react-router-dom';
export const HomaPage = () => {
	const { seasons, dispatch } = useContext(SeassonContext);
	const navigate = useNavigate();

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
							<List.Item className={styles.winner_item} onClick={() => navigate(`/winners`)}>
								<span className={styles.badge}>
									<Trophy />
								</span>
								<div className={styles.winner_info}>
									<h4>Winners</h4>
								</div>
							</List.Item>
						</List.Container>
						<ListSeassons />
					</>
				)}
			</Main>
		</>
	);
};
