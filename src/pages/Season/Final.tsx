import { useContext, useEffect } from 'react';
import styles from './styles.module.css';
// import { SeassonContext } from '../../store';
import confetti from 'canvas-confetti';
import { useCurrentSeasonParams } from '../../hooks';
import { Button, MatchList } from '../../components/ui';
import { TBlockedFase } from '../../store/Seasson/seassonReducer';
import { SeassonContext } from '../../store';
export const Final = () => {
	const { dispatch } = useContext(SeassonContext);
	const { season } = useCurrentSeasonParams();
	const final = season?.fase.final;
	const semifinals = season?.fase.semifinal;
	const winner = final?.winners && final?.winners[0];
	useEffect(() => {
		if (final?.status === 'FINISHED') {
			const end = Date.now() + 4.5 * 1000;
			const colors = [winner?.color || '#D4AF37', '#ffffff'];

			(function frame() {
				confetti({
					particleCount: 2,
					angle: 60,
					spread: 55,
					origin: { x: 0 },
					colors: colors,
				});
				confetti({
					particleCount: 2,
					angle: 120,
					spread: 55,
					origin: { x: 1 },
					colors: colors,
				});

				if (Date.now() < end) {
					requestAnimationFrame(frame);
				}
			})();
		}
	}, [final?.status]);

	const onFinishSeasons = () => {
		dispatch({
			type: '[SEASSON] - UPDATED STATUS FASE',
			payload: {
				sid: season?.uuid,
				type: 'final',
				status: 'BLOCKED',
			} as TBlockedFase,
		});
		dispatch({
			type: '[SEASSON] - FINISHED SEASON',
			payload: {
				sid: season?.uuid,
				winner,
			},
		});
	};
	switch (final?.status) {
		case 'ACTIVE':
			return (
				<>
					{final.matches.matches.map((journey, i) => (
						<MatchList
							type='FINAL'
							key={`jy=${journey.jid}`}
							title={`Final 🏆`}
							matches={journey}
							isCurrent={final.currentJourney === i + 1}
						/>
					))}
				</>
			);
		case 'FINISHED': {
			return (
				<>
					<div className={styles.body}>
						{semifinals?.matches.matches.map((journey, i) => (
							<MatchList
								type='SEMI'
								key={`jy=${journey.jid}`}
								title={`Semifinals`}
								matches={journey}
								isCurrent={final.currentJourney === i + 1}
							/>
						))}
						{final.matches.matches.map((journey, i) => (
							<MatchList
								type='SEMI'
								key={`jy=${journey.jid}`}
								title={`Final 🏆`}
								matches={journey}
								isCurrent={final.currentJourney === i + 1}
							/>
						))}

						<div className={styles.status_container}>
							{winner && (
								<div className={styles.champion_container}>
									<h1>Supercup 🏆</h1>
									<img src={winner.image} />

								</div>
							)}

							<Button.Primary className={styles.button} onClick={onFinishSeasons}>
								Continue
							</Button.Primary>
						</div>
					</div>
					<div
						className={styles.bg_gradient}
						style={{
							background: `linear-gradient(180deg, #171717 40%, ${winner?.color} 159.3%)`,
						}}
					/>
				</>
			);
		}
		default:
			return <></>;
	}
};
