import Button from '../Button';
import { Fire, Loader } from '../../icons';
import styles from './styles.module.css';
import { SeassonContext, TJourney } from '../../../store';
import { ItemMatch } from './ItemMatch';
import { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';

interface IMatchList {
	title: string;
	matches: TJourney;
	isCurrent: boolean;
}
export const MatchList = ({ title, matches, isCurrent }: IMatchList) => {
	const { dispatch } = useContext(SeassonContext);
	const { sid } = useParams();
	const [isLoading, setIsLoading] = useState(false);
	const simulateMatches = () => {
		setIsLoading(true);
		const id = setTimeout(() => {
			dispatch({
				type: '[SEASSON-REGULAR] - ADD MATCH SCORE',
				payload: {
					uuid: sid,
					matches,
				},
			});
			setIsLoading(false);
			clearTimeout(id);
		}, 900);
	};
	return (
		<div className={`${styles.container} ${styles.current_matches}`}>
			<div className={styles.header}>
				<h3>{title}</h3>
				{isCurrent && (
					<>
						{!isLoading ? (
							<Button.Primary onClick={simulateMatches} className={styles.btn_simulate}>
								<Fire />
								Simular
							</Button.Primary>
						) : (
							<Loader />
						)}
					</>
				)}
			</div>
			<ul className={styles.matches_list}>
				{matches.value.map(match => (
					<ItemMatch key={match.uuid} {...match} />
				))}
			</ul>
		</div>
	);
};
