import { useContext } from 'react';
import { Button, MatchList } from '../../components/ui';
import { useCurrentSeasonParams } from '../../hooks';
import { SeassonContext } from '../../store';
import styles from './styles.module.css';
export const StatusJourney = () => {
	const { myClub } = useContext(SeassonContext);
	const season = useCurrentSeasonParams();

	if (typeof season === 'undefined' || typeof myClub === 'undefined') {
		return <></>;
	}
	const regular = season.fase.regular;

	switch (regular.status) {
		case 'ACTIVE': {
			const totalJourney = regular.matches.matches.length;
			return (
				<>
					{regular.matches.matches.map((journey, i) => (
						<MatchList
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
					{regular.matches.matches.map((journey, i) => (
						<MatchList
							key={`jy=${journey.jid}`}
							title={`Journey ${i + 1} of ${totalJourney}`}
							matches={journey}
							isCurrent={false}
						/>
					))}
					<div className={styles.status_container}>
						<h2>The regular season has ended</h2>
						{position <= 4 ? (
							<p>Congratulations! your team is in the Semifinals 🎉</p>
						) : (
							<p>Sorry! Your team will not be in the semifinals</p>
						)}
						<Button.Primary className={styles.button} onClick={() => {}}>
							Continue
						</Button.Primary>
					</div>
				</>
			);
		}

		default: {
			return <>Ha finalizado</>;
		}
	}
};
