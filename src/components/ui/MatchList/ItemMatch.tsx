import { useContext, useMemo } from 'react';
import { SeassonContext, TMatches } from '../../../store';
import { ItemClub } from '..';
import { Star } from '../../icons';
import styles from './styles.module.css';

export const ItemMatch = ({ local, visit }: TMatches) => {
	const { myClub } = useContext(SeassonContext);

	const isMyClub = useMemo(
		() => myClub?.uuid === local.uuid || myClub?.uuid === visit.uuid,
		[myClub],
	);

	const setScore = () => {};
	return (
		<li className={styles.match} onClick={isMyClub ? setScore : undefined}>
			{isMyClub && (
				<span className={styles.match_player}>
					<Star />
				</span>
			)}
			<ItemClub className={styles.club} image={local.image} name={local.name} />
			<p className={styles.match_score}>
				{local.score} - {visit.score}
			</p>
			<ItemClub className={styles.club} image={visit.image} name={visit.name} />
		</li>
	);
};
