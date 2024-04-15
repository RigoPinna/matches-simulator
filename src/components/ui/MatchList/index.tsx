import Button from '../Button';
import { Fire, Loader } from '../../icons';
import styles from './styles.module.css';
import { SeassonContext, TJourney } from '../../../store';
import { ItemMatch } from './ItemMatch';
import { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TType } from '../../../store/Seasson/seassonReducer';

interface IMatchList {
	title: string;
	matches: TJourney;
	isCurrent: boolean;
	type: 'REGULAR' | 'SEMI' | 'FINAL';
}
const TYPE_ACTION = {
	REGULAR: '[SEASSON-REGULAR] - ADD MATCH SCORE',
	SEMI: '[SEASSON-SEMIFINALS] - ADD MATCH SCORE',
	FINAL: '[SEASSON-FINAL] - ADD MATCH SCORE',
};
Object.freeze(TYPE_ACTION);
export const MatchList = ({ title, matches, isCurrent, type }: IMatchList) => {
	const { dispatch } = useContext(SeassonContext);
	const { sid } = useParams();
	const [isLoading, setIsLoading] = useState(false);
	const simulateMatches = () => {
		setIsLoading(true);
		const id = setTimeout(() => {
			dispatch({
				type: TYPE_ACTION[type] as TType,
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
								Simulate
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
