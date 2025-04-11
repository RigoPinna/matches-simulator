import { useContext, useMemo } from 'react';
import { Exit, Ok } from '../../icons';
import styles from './styles.module.css';
import { SeassonContext, TMatches } from '../../../store';
export const LastMatchesRecord = () => {
	const { seasons } = useContext(SeassonContext);

	const lastMatches = useMemo(() => {
		const lastSeason = seasons[seasons.length - 1];
		const journeys = lastSeason.fase.regular.matches.matches;
		let regular: TMatches[] = [];

		for (const matches of journeys) {
			const matchesDone = matches.value.filter(match => match.status === 'DONE');
			if (matchesDone) regular = [...matchesDone];
		}
		return regular;
	}, [seasons]);

	console.log(lastMatches);
	return (
		<div className={styles.container}>
			<div className={styles.container_list}>
				<span className={`${styles.match} ${styles.match_win}`}>
					<Ok />
				</span>
				<span className={`${styles.match} ${styles.match_draw}`}>-</span>
				<span className={`${styles.match} ${styles.match_lose}`}>
					<Exit />
				</span>
			</div>
			<p className={styles.description}>Last matches league</p>
		</div>
	);
};
