import Button from '../Button';
import { Fire, Loader } from '../../icons';
import styles from './styles.module.css';
import { SeassonContext, TJourney, isReadOnlyLeague } from '../../../store';
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

type TJourneyState = 'NOW' | 'PLAYED' | 'UPCOMING';
const STATE_LABEL: Record<TJourneyState, string> = { NOW: 'Now', PLAYED: 'Played', UPCOMING: 'Upcoming' };

/** One journey (or knockout round) as a card of scoreboard rows. */
export const MatchList = ({ title, matches, isCurrent, type }: IMatchList) => {
	const { myClub, dispatch } = useContext(SeassonContext);
	const { season } = useCurrentSeasonParams();
	const [isLoading, setIsLoading] = useState(false);
	// International leagues only advance together with the user's league.
	const readOnly = season ? isReadOnlyLeague(season.league) : false;
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
	const isMine = (m: TJourney['value'][number]) =>
		m.local.uuid === myClub?.uuid || m.visit.uuid === myClub?.uuid;
	const pendingOthers = matches.value.some(m => !isMine(m) && m.status === 'TODO');
	const pendingMine = matches.value.some(m => isMine(m) && m.status === 'TODO');
	const state: TJourneyState =
		matches.status === 'DONE' ? 'PLAYED' : isCurrent ? 'NOW' : 'UPCOMING';
	// The user's pending match goes first so it's the first thing to see.
	const ordered = [...matches.value].sort(
		(a, b) => Number(isMine(b) && b.status === 'TODO') - Number(isMine(a) && a.status === 'TODO'),
	);
	const canSimulate = isCurrent && pendingOthers && !readOnly;

	return (
		<section className={`${styles.card} ${state === 'NOW' ? styles.card_now : ''}`}>
			<div className={styles.header}>
				{title && <h3>{title}</h3>}
				<span className={`${styles.state} ${styles[`state_${state.toLowerCase()}`]}`}>
					{STATE_LABEL[state]}
				</span>
				{isCurrent && (isLoading || canSimulate) && (
					<div className={styles.header_action}>
						{isLoading ? (
							<Loader />
						) : (
							<Button.Primary onClick={simulateMatches} className={styles.btn_simulate}>
								<Fire />
								Simulate
							</Button.Primary>
						)}
					</div>
				)}
			</div>
			{isCurrent && !pendingOthers && pendingMine && !readOnly && (
				<p className={styles.hint}>Only your match is left — enter your score to finish the journey.</p>
			)}
			<ul className={styles.matches_list}>
				{ordered.map(match => (
					<ItemMatch key={match.uuid} {...match} type={type} jid={matches.jid} />
				))}
			</ul>
		</section>
	);
};
