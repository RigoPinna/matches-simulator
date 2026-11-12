import { useContext, useEffect, useMemo, useState } from 'react';
import { ITeamMatch, SeassonContext, TWorldCup } from '../../store';
import { getGroupStandings } from '../../helpers';
import { Button, ClubBadge } from '../../components/ui';
import styles from './styles.module.css';

const FLIP_MS = 850;

export const KnockoutDraw = ({ worldCup }: { worldCup: TWorldCup }) => {
	const { dispatch } = useContext(SeassonContext);
	const matches = worldCup.quarterfinals;
	const totalCards = matches.length * 2;
	// Cards flip in bracket order: QF1 winner, QF1 runner-up, QF2 winner...
	const [flipped, setFlipped] = useState(0);
	const animating = flipped < totalCards;

	useEffect(() => {
		if (!animating) return;
		const id = setTimeout(() => setFlipped(f => f + 1), flipped === 0 ? 500 : FLIP_MS);
		return () => clearTimeout(id);
	}, [animating, flipped]);

	const origin = useMemo(() => {
		const map = new Map<string, string>();
		for (const standing of getGroupStandings(worldCup.groups)) {
			map.set(standing.first.uuid, `1st Group ${standing.group}`);
			map.set(standing.second.uuid, `2nd Group ${standing.group}`);
		}
		return map;
	}, [worldCup.groups]);

	const startKnockout = () =>
		dispatch({ type: '[WORLDCUP] - START KNOCKOUT', payload: { wid: worldCup.uuid } });

	const renderCard = (team: ITeamMatch, index: number) => (
		<div className={`${styles.flip} ${index < flipped ? styles.flip_done : ''}`}>
			<div className={styles.flip_inner}>
				<div className={`${styles.flip_face} ${styles.flip_back}`}>?</div>
				<div className={`${styles.flip_face} ${styles.flip_front}`}>
					<ClubBadge className={styles.badge_sm} {...team} />
					<div>
						<p>{team.name}</p>
						<span>{origin.get(team.uuid)}</span>
					</div>
				</div>
			</div>
		</div>
	);

	return (
		<>
			<h2 className={styles.stage_title}>Quarterfinal draw</h2>
			<p className={styles.hint}>
				Group winners face a runner-up from another group. The draw also decides the bracket.
			</p>

			<div className={styles.ko_draw_list}>
				{matches.map((match, i) => (
					<div key={match.uuid} className={styles.ko_draw_match}>
						<h4>Quarterfinal {i + 1}</h4>
						<div className={styles.ko_draw_pair}>
							{renderCard(match.local, i * 2)}
							<span>vs</span>
							{renderCard(match.visit, i * 2 + 1)}
						</div>
					</div>
				))}
			</div>

			<div className={styles.paths}>
				Semifinal 1: winner QF1 vs winner QF2
				<br />
				Semifinal 2: winner QF3 vs winner QF4
			</div>

			<div className={styles.actions}>
				{animating ? (
					<Button.Secondary className={styles.button_secondary} onClick={() => setFlipped(totalCards)}>
						Skip animation
					</Button.Secondary>
				) : (
					<>
						<Button.Primary className={styles.button_main} onClick={startKnockout}>
							Continue
						</Button.Primary>
						<Button.Secondary className={styles.button_secondary} onClick={() => setFlipped(0)}>
							Replay draw
						</Button.Secondary>
					</>
				)}
			</div>
		</>
	);
};
