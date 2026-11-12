import { useContext, useEffect, useRef, useState } from 'react';
import { SeassonContext, TWorldCup } from '../../store';
import { isGroupStageFinished } from '../../store/WorldCup/worldCupReducer';
import { getGroupStandings, isMyClub } from '../../helpers';
import { Button, ItemClub, Table } from '../../components/ui';
import { Fire, Loader } from '../../components/icons';
import { WorldCupMatch } from './WorldCupMatch';
import styles from './styles.module.css';

const SIMULATE_DELAY_MS = 900;

export const GroupTables = ({ worldCup }: { worldCup: TWorldCup }) => (
	<>
		{worldCup.groups.map(group => (
			<div key={group.name} className={styles.group_table}>
				<h4>Group {group.name}</h4>
				<Table table={group.table} variant='group' />
			</div>
		))}
	</>
);

export const Groups = ({ worldCup }: { worldCup: TWorldCup }) => {
	const { myClub, dispatch } = useContext(SeassonContext);
	const [isLoading, setIsLoading] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout>>();
	useEffect(() => () => clearTimeout(timer.current), []);

	const wid = worldCup.uuid;
	const totalJourneys = worldCup.groups[0]?.journeys.length ?? 0;
	const j = worldCup.groupJourney;
	const finished = isGroupStageFinished(worldCup);

	const pendingOthers = finished
		? false
		: worldCup.groups.some(group =>
			group.journeys[j].value.some(
				match => match.status === 'TODO' && !(myClub && isMyClub(match, myClub)),
			),
		);

	const simulate = () => {
		setIsLoading(true);
		timer.current = setTimeout(() => {
			dispatch({ type: '[WORLDCUP] - SIMULATE GROUP JOURNEY', payload: { wid } });
			setIsLoading(false);
		}, SIMULATE_DELAY_MS);
	};
	const drawKnockout = () => dispatch({ type: '[WORLDCUP] - DRAW KNOCKOUT', payload: { wid } });

	const renderJourney = (index: number) =>
		worldCup.groups.map(group => (
			<div key={`${group.name}-${index}`}>
				<p className={styles.group_label}>Group {group.name}</p>
				<ul className={styles.match_list}>
					{group.journeys[index].value.map(match => (
						<WorldCupMatch key={match.uuid} wid={wid} match={match} knockout={false} />
					))}
				</ul>
			</div>
		));

	return (
		<>
			<h2 className={styles.stage_title}>Group stage</h2>
			<p className={styles.hint}>The top 2 of each group go to the quarterfinals</p>

			<div className={styles.section}>
				<GroupTables worldCup={worldCup} />
			</div>

			{finished ? (
				<div className={styles.section}>
					<h3 className={styles.section_title}>Group stage finished</h3>
					<div className={styles.qualified_list}>
						{getGroupStandings(worldCup.groups).map(standing => (
							<div key={standing.group} className={styles.qualified_item}>
								<h5>Group {standing.group}</h5>
								<ItemClub {...standing.first} />
								<ItemClub {...standing.second} />
							</div>
						))}
					</div>
					<div className={styles.actions}>
						<Button.Primary className={styles.button_main} onClick={drawKnockout}>
							Quarterfinal draw
						</Button.Primary>
					</div>
				</div>
			) : (
				<div className={styles.section}>
					<div className={styles.section_header}>
						<h3>
							Matchday {j + 1} of {totalJourneys}
						</h3>
						{isLoading ? (
							<Loader />
						) : (
							pendingOthers && (
								<Button.Primary onClick={simulate}>
									<Fire />
									Simulate
								</Button.Primary>
							)
						)}
					</div>
					{!pendingOthers && !isLoading && (
						<p className={styles.hint}>Tap your match ⭐ to enter your score</p>
					)}
					{renderJourney(j)}
				</div>
			)}

			{j > 0 && (
				<details className={styles.details}>
					<summary>Previous matchdays</summary>
					{Array.from({ length: Math.min(j, totalJourneys) }, (_, i) => (
						<div key={`past-${i}`} className={styles.section}>
							<h3 className={styles.section_title}>Matchday {i + 1}</h3>
							{renderJourney(i)}
						</div>
					))}
				</details>
			)}
		</>
	);
};
