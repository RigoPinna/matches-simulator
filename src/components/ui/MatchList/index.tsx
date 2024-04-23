import Button from '../Button';
import { Fire, Loader } from '../../icons';
import styles from './styles.module.css';
import { SeassonContext, TJourney } from '../../../store';
import { ItemMatch } from './ItemMatch';
import { useContext, useState } from 'react';
import { TType } from '../../../store/Seasson/seassonReducer';
import { useCurrentSeasonParams } from '../../../hooks';

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
	const { myClub, dispatch } = useContext(SeassonContext);
	const season = useCurrentSeasonParams();
	const [isLoading, setIsLoading] = useState(false);
	const simulateMatches = () => {
		setIsLoading(true);
		const id = setTimeout(() => {
			dispatch({
				type: TYPE_ACTION[type] as TType,
				payload: {
					uuid: season?.uuid,
					matches,
				},
			});
			setIsLoading(false);
			clearTimeout(id);
		}, 900);
	};
	function showButton() {
		const myMatch = matches.value.find(
			match => match.local.uuid === myClub?.uuid || match.visit.uuid === myClub?.uuid,
		);
		if (typeof myMatch === 'undefined') {
			return matches.value.some(match => match.status === 'TODO');
		}
		if (myMatch?.status === 'DONE') {
			return matches.status === 'TODO';
		}
		if (myMatch?.status === 'TODO') {
			const olthersMatches = matches.value.filter(item => item.uuid !== myMatch.uuid);
			return olthersMatches.some(match => match.status === 'TODO');
		}
	}
	return (
		<div className={`${styles.container} ${styles.current_matches}`}>
			<div className={styles.header}>
				<h3>{title}</h3>
				{isCurrent && (
					<>
						{!isLoading ? (
							<>
								{showButton() && (
									<Button.Primary onClick={simulateMatches} className={styles.btn_simulate}>
										<Fire />
										Simulate
									</Button.Primary>
								)}
							</>
						) : (
							<Loader />
						)}
					</>
				)}
			</div>
			<ul className={styles.matches_list}>
				{matches.value.map(match => (
					<ItemMatch key={match.uuid} {...match} type={type} jid={matches.jid} />
				))}
			</ul>
		</div>
	);
};
