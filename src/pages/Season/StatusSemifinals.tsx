import { useContext, useEffect, useMemo } from 'react';
import { Button, MatchList } from '../../components/ui';
import { useCurrentSeasonParams } from '../../hooks';
import styles from './styles.module.css';
import { SeassonContext } from '../../store';
import confetti from 'canvas-confetti';
import { TBlockedFase } from '../../store/Seasson/seassonReducer';
export const StatusSemifinals = () => {
	const { myClub, dispatch } = useContext(SeassonContext);
	const season = useCurrentSeasonParams();
	const semifinals = season?.fase.semifinal;
	const isWinner = useMemo(
		() => semifinals?.winners?.some(item => item.uuid === myClub?.uuid),
		[semifinals?.winners],
	);
	useEffect(() => {
		if (season) {
			if (semifinals?.status === 'FINISHED' && isWinner) {
				confetti({
					particleCount: 100,
					spread: 70,
					origin: { y: 0.6 },
				});
			}
		}
	}, [semifinals?.status]);
	const goToFinal = () => {
		dispatch({
			type: '[SEASSON] - UPDATED STATUS FASE',
			payload: {
				sid: season?.uuid,
				type: 'semifinal',
				status: 'BLOCKED',
			} as TBlockedFase,
		});
		dispatch({
			type: '[SEASSON-FINAL] - SET MATCHES',
			payload: season?.uuid,
		});
	};
	switch (semifinals?.status) {
		case 'ACTIVE':
			return (
				<>
					{semifinals.matches.matches.map((journey, i) => (
						<MatchList
							type='SEMI'
							key={`jy=${journey.jid}`}
							title={`Semifinals`}
							matches={journey}
							isCurrent={semifinals.currentJourney === i + 1}
						/>
					))}
				</>
			);
		case 'FINISHED': {
			return (
				<>
					<div className={styles.status_container}>
						<h2>The semifinals has ended</h2>
						{isWinner && <p>Congratulations! your team is in the final🏆🎉</p>}
						<p>Let's go to the final🏆</p>

						<Button.Primary className={styles.button} onClick={goToFinal}>
							Continue
						</Button.Primary>
					</div>
					{semifinals.matches.matches.map((journey, i) => (
						<MatchList
							type='SEMI'
							key={`jy=${journey.jid}`}
							title={`Semifinals`}
							matches={journey}
							isCurrent={semifinals.currentJourney === i + 1}
						/>
					))}
				</>
			);
		}
		default:
			return <></>;
	}
};
