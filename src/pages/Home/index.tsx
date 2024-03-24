import { useContext } from 'react';
import { Main } from '../../components/layouts';
import { Header, Button, ListSeassons } from '../../components/ui';
import { SeassonContext } from '../../store';
import styles from './styles.module.css';
import { GameFilled, GameOutlined } from '../../components/icons';
export const HomaPage = () => {
	const { seasons, dispatch } = useContext(SeassonContext);

	const handleCreateNewSeason = () => {
		dispatch({
			type: '[SEASSON] - NEW SEASSON',
		});
	};
	return (
		<>
			<Header className={styles.home_header}>
				<h1>Seassons</h1>
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
					<ListSeassons />
				)}
			</Main>
		</>
	);
};
