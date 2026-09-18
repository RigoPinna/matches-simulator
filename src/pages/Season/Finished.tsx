import { useMemo } from 'react';
import { useCurrentSeasonParams } from '../../hooks';
import { ClubBadge, MatchList } from '../../components/ui';
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
										<ClubBadge className={styles.champion_team} image={season?.table[0].club.image} name={season?.table[0].club.name || ''} color={season?.table[0].club.color} />
										<img className={styles.trophy} src={ligeImg} />
									</div>
									<div className={styles.champion_container}>
										<ClubBadge className={styles.champion_team} image={season?.fase?.final?.winners[0].image} name={season?.fase?.final?.winners[0].name || ''} color={season?.fase?.final?.winners[0].color} />
										<img className={styles.trophy} src={supercupImg} />
									</div>
								</>
							) : (
								<div className={styles.champion_container}>
									<ClubBadge className={styles.champion_team} image={season?.table[0].club.image} name={season?.table[0].club.name || ''} color={season?.table[0].club.color} />
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
