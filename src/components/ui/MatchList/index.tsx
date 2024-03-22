import { ItemClub } from '..';
import Button from '../Button';
import { Fire } from '../../icons';
import club from '../../../assets/america-logo.png';
import styles from './styles.module.css';
import { Star } from '../../icons/Star';

export const MatchList = () => {
	return (
		<div className={`${styles.container} ${styles.current_matches}`}>
			<div className={styles.header}>
				<h3>Jornada 1 de 5</h3>
				<Button.Primary className={styles.btn_simulate} onClick={() => {}}>
					<Fire />
					Simular
				</Button.Primary>
			</div>
			<ul className={styles.matches_list}>
				<li className={styles.match}>
					<ItemClub className={styles.club} image={club} name='America' />
					<p className={styles.match_score}>2 - 0</p>
					<ItemClub className={styles.club} image={club} name='America' />
					<span className={styles.match_player}>
						<Star />
					</span>
				</li>
				<li className={styles.match}>
					<ItemClub className={styles.club} image={club} name='America' />
					<p className={styles.match_score}>-</p>
					<ItemClub className={styles.club} image={club} name='America' />
				</li>
				<li className={styles.match}>
					<ItemClub className={styles.club} image={club} name='America' />
					<p className={styles.match_score}>-</p>
					<ItemClub className={styles.club} image={club} name='America' />
				</li>
			</ul>
		</div>
	);
};
