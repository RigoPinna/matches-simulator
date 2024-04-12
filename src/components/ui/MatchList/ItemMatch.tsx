import styles from './styles.module.css';
import { TMatches } from '../../../store';
import { ItemClub } from '..';
import { Star } from '../../icons';
export const ItemMatch = ({ local, visit }: TMatches) => {
	return (
		<li className={styles.match}>
			<ItemClub className={styles.club} image={local.image} name={local.name} />
			<p className={styles.match_score}>
				{local.score} - {visit.score}
			</p>
			<ItemClub className={styles.club} image={visit.image} name={visit.name} />
			<span className={styles.match_player}>
				<Star />
			</span>
		</li>
	);
};
