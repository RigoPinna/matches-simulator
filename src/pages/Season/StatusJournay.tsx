import { useContext, useEffect } from 'react';
import { Button, ItemClub, MatchList } from '../../components/ui';
import { useCurrentSeasonParams } from '../../hooks';
import { SeassonContext } from '../../store';
import styles from './styles.module.css';
import confetti from 'canvas-confetti';
import { TBlockedFase } from '../../store/Seasson/seassonReducer';
export const StatusJourney = () => {
	const { myClub, dispatch } = useContext(SeassonContext);
	const season = useCurrentSeasonParams();
	const regular = season?.fase.regular;
	useEffect(() => {
		if (season) {
			const position = season.table.findIndex(item => item.club.uuid === myClub?.uuid) + 1;
			if (regular?.status === 'FINISHED' && position <= 4) {
				confetti({
					particleCount: 100,
					spread: 70,
					origin: { y: 0.6 },
				});
			}
		}
	}, [regular?.status]);
	if (typeof season === 'undefined' || typeof myClub === 'undefined') {
		return <></>;
	}
	const goToSemifinals = () => {
		dispatch({
			type: '[SEASSON] - UPDATED STATUS FASE',
			payload: {
				sid: season.uuid,
				type: 'regular',
				status: 'BLOCKED',
			} as TBlockedFase,
		});
		dispatch({
			type: '[SEASSON-SEMIFINALS] - SET MATCHES',
			payload: season.uuid,
		});
	};
	switch (regular?.status) {
		case 'ACTIVE': {
			const totalJourney = regular.matches.matches.length;
			return (
				<>
					{regular.matches.matches.map((journey, i) => (
						<MatchList
							type='REGULAR'
							key={`jy=${journey.jid}`}
							title={`Journey ${i + 1} of ${totalJourney}`}
							matches={journey}
							isCurrent={regular.currentJourney === i + 1}
						/>
					))}
				</>
			);
		}
		case 'FINISHED': {
			const position = season.table.findIndex(item => item.club.uuid === myClub.uuid) + 1;
			const totalJourney = regular.matches.matches.length;
			return (
				<>
					<div className={styles.status_container}>
						<h2>The regular season has ended</h2>
						<h3>Champion:</h3>
						<ItemClub {...season.table[0].club} />
						{position <= 4 ? (
							<p>Congratulations! your team is in the Supercup 🎉</p>
						) : (
							<p>Sorry! Your team will not be in the SuperCup</p>
						)}
						<Button.Primary className={styles.button} onClick={goToSemifinals}>
							Continue
						</Button.Primary>
					</div>
					{regular.matches.matches.map((journey, i) => (
						<MatchList
							type='REGULAR'
							key={`jy=${journey.jid}`}
							title={`Journey ${i + 1} of ${totalJourney}`}
							matches={journey}
							isCurrent={false}
						/>
					))}
					<div className={styles.status_container}>
						<h2>The regular season has ended</h2>
						<h3>Champion:</h3>
						<ItemClub {...season.table[0].club} />
						{position <= 4 ? (
							<p>Congratulations! your team is in the Supercup 🎉</p>
						) : (
							<p>Sorry! Your team will not be in the SuperCup</p>
						)}
						<Button.Primary className={styles.button} onClick={goToSemifinals}>
							Continue
						</Button.Primary>
					</div>
				</>
			);
		}

		default: {
			return <></>;
		}
	}
};
