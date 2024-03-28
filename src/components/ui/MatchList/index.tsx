import Button from '../Button';
import { Fire } from '../../icons';
import styles from './styles.module.css';
import { SeassonContext, TMatches } from '../../../store';
import { ItemMatch } from './ItemMatch';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';

interface IMatchList {
	title: string;
	matches: TMatches[];
	isCurrent: boolean;
}
export const MatchList = ({ title, matches, isCurrent }: IMatchList) => {
	const { dispatch } = useContext(SeassonContext);
	const { sid } = useParams();
	const simulateMatches = () => {
		dispatch({
			type: '[SEASSON-REGULAR] - ADD MATCH SCORE',
			payload: {
				uuid: sid,
				matches,
			},
		});
	};
	return (
		<div className={`${styles.container} ${styles.current_matches}`}>
			<div className={styles.header}>
				<h3>{title}</h3>
				{isCurrent && (
					<Button.Primary onClick={simulateMatches} className={styles.btn_simulate}>
						<Fire />
						Simular
					</Button.Primary>
				)}
			</div>
			<ul className={styles.matches_list}>
				{matches.map(match => (
					<ItemMatch key={match.uuid} {...match} />
				))}
			</ul>
		</div>
	);
};
