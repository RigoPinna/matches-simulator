import { useMemo } from 'react';
import { useCurrentSeasonParams } from '../../hooks';
import { MatchList } from '../../components/ui';
import ligeImg from '../../assets/champion.png';
import supercupImg from '../../assets/supercup.png';
import styles from './styles.module.css';
export const Finished = () => {
	const { season } = useCurrentSeasonParams();
	const isFinished = useMemo(() => {
		return (
			season?.fase.regular.status === 'BLOCKED' &&
			season?.fase.semifinal.status === 'BLOCKED' &&
			season?.fase.final.status === 'BLOCKED'
		);
	}, [season?.fase]);
	if (!isFinished) {
		return <></>;
	}
	return (
		<div className={styles.body_finished}>
			<details>
				<summary>Regular</summary>
				{season?.fase.regular.matches.matches.map((journey, i) => (
					<MatchList
						type='REGULAR'
						key={`jy=${journey.jid}`}
						title={`Journey ${i + 1} of ${season?.fase.regular.matches.matches.length}`}
						matches={journey}
						isCurrent={false}
					/>
				))}
			</details>
			<details>
				<summary>Semifinals</summary>
				{season?.fase.semifinal.matches.matches.map(journey => (
					<MatchList
						type='SEMI'
						key={`jy=${journey.jid}`}
						title=''
						matches={journey}
						isCurrent={false}
					/>
				))}
			</details>
			<details className={styles.final_container} open>
				<summary>Final</summary>
				{season?.fase.final.matches.matches.map(journey => (
					<MatchList
						type='FINAL'
						key={`jy=${journey.jid}`}
						title=''
						matches={journey}
						isCurrent={false}
					/>
				))}
				<div className={styles.status_container}>
					<div className={styles.winner_wrapper}>
						{
							season?.fase?.final?.winners && season?.table[0].club.uuid !== season?.fase?.final?.winners[0].uuid ? (
								<>
									<div className={styles.champion_container}>
										<img className={styles.champion_team} src={season?.table[0].club.image} />
										<img className={styles.trophy} src={ligeImg} />
									</div>
									<div className={styles.champion_container}>
										<img className={styles.champion_team} src={season?.fase?.final?.winners[0].image} />
										<img className={styles.trophy} src={supercupImg} />
									</div>
								</>
							) : (
								<div className={styles.champion_container}>
									<img className={styles.champion_team} src={season?.table[0].club.image} />
									<img className={styles.trophy} src={ligeImg} />
									<img className={`${styles.trophy} ${styles.trophy_super_cup}`} src={supercupImg} />
								</div>
							)
						}




					</div>
				</div>
			</details>
		</div>
	);
};
