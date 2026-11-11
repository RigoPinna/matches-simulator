import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SeassonContext, TMatches, TWorldCup } from '../../store';
import { Button, Table } from '../../components/ui';
import { Bracket, Champion } from './Knockout';
import { WorldCupMatch } from './WorldCupMatch';
import styles from './styles.module.css';

const MatchList = ({ wid, matches, knockout }: { wid: string; matches: TMatches[]; knockout: boolean }) => (
	<ul className={styles.match_list}>
		{matches.map(match => (
			<WorldCupMatch key={match.uuid} wid={wid} match={match} knockout={knockout} />
		))}
	</ul>
);

/**
 * Full record of a finished World Cup: champion, bracket, every knockout
 * result and the whole group stage (tables + all matchdays).
 */
export const Summary = ({ worldCup }: { worldCup: TWorldCup }) => {
	const { dispatch } = useContext(SeassonContext);
	const navigate = useNavigate();
	const wid = worldCup.uuid;

	const close = () => {
		dispatch({ type: '[WORLDCUP] - CLOSE', payload: { wid } });
		navigate('/');
	};

	const knockoutRounds = [
		{ title: 'Final 🏆', matches: worldCup.final },
		{ title: 'Semifinals', matches: worldCup.semifinals },
		{ title: 'Quarterfinals', matches: worldCup.quarterfinals },
	];

	return (
		<div className={styles.content}>
			<Champion worldCup={worldCup} />

			<div className={styles.section}>
				<h3 className={styles.section_title}>Bracket</h3>
				<Bracket worldCup={worldCup} />
				{knockoutRounds.map(round => (
					<div key={round.title} className={styles.section}>
						<h3 className={styles.section_title}>{round.title}</h3>
						<MatchList wid={wid} matches={round.matches} knockout />
					</div>
				))}
			</div>

			<div className={styles.section}>
				<h3 className={styles.section_title}>Group stage</h3>
				{worldCup.groups.map(group => (
					<div key={group.name} className={styles.group_table}>
						<h4>Group {group.name}</h4>
						<Table table={group.table} variant='group' />
						<details className={styles.details}>
							<summary>Matches</summary>
							{group.journeys.map((journey, i) => (
								<div key={journey.jid}>
									<p className={styles.group_label}>Matchday {i + 1}</p>
									<MatchList wid={wid} matches={journey.value} knockout={false} />
								</div>
							))}
						</details>
					</div>
				))}
			</div>

			{worldCup.isCurrent && (
				<div className={styles.actions}>
					<Button.Primary className={styles.button_main} onClick={close}>
						Continue
					</Button.Primary>
				</div>
			)}
		</div>
	);
};
