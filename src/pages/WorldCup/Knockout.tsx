import { useContext, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { ITeamMatch, SeassonContext, TMatches, TWorldCup } from '../../store';
import { getCurrentRound } from '../../store/WorldCup/worldCupReducer';
import { getWinner, isMyClub } from '../../helpers';
import { Button, ClubBadge } from '../../components/ui';
import { WorldCupMatch } from './WorldCupMatch';
import { GroupTables } from './Groups';
import worldCupTrophy from '../../assets/wp-thropy.png';
import styles from './styles.module.css';

const SIMULATE_DELAY_MS = 900;

const ROUND_TITLE: Partial<Record<TWorldCup['stage'], string>> = {
	QUARTERS: 'Quarterfinals',
	SEMIS: 'Semifinals',
	FINAL: 'Final 🏆',
};

/** One club square of the bracket (badge on top, score below). */
const Tile = ({ match, side }: { match?: TMatches; side: 'local' | 'visit' }) => {
	const { myClub } = useContext(SeassonContext);
	if (!match) {
		return (
			<div className={styles.tile}>
				<span className={styles.tile_empty}>?</span>-
			</div>
		);
	}
	const team: ITeamMatch = match[side];
	const done = match.status === 'DONE';
	const isLoser = done && getWinner(match).loser.uuid === team.uuid;
	return (
		<div
			className={`${styles.tile} ${isLoser ? styles.tile_loser : ''} ${myClub?.uuid === team.uuid ? styles.tile_mine : ''}`}>
			<ClubBadge className={styles.tile_badge} {...team} />
			{done ? team.score : '-'}
		</div>
	);
};

const Pair = ({ match }: { match?: TMatches }) => (
	<div className={styles.bracket_pair}>
		<Tile match={match} side='local' />
		<Tile match={match} side='visit' />
	</div>
);

export const Bracket = ({ worldCup }: { worldCup: TWorldCup }) => {
	const [qf1, qf2, qf3, qf4] = worldCup.quarterfinals;
	const [sf1, sf2] = worldCup.semifinals;
	const [final] = worldCup.final;
	return (
		<div className={styles.bracket}>
			<div className={styles.bracket_row}>
				<div className={styles.bracket_half}>
					<Pair match={qf1} />
					<Pair match={qf2} />
				</div>
				<div className={styles.bracket_half}>
					<Pair match={qf3} />
					<Pair match={qf4} />
				</div>
			</div>
			<div className={styles.bracket_row}>
				<div className={styles.bracket_half}>
					<Pair match={sf1} />
				</div>
				<div className={styles.bracket_half}>
					<Pair match={sf2} />
				</div>
			</div>
			<div className={`${styles.bracket_row} ${styles.bracket_center}`}>
				<Pair match={final} />
			</div>
		</div>
	);
};

/** Champion badge + trophy; confetti only the first time (World Cup still current). */
export const Champion = ({ worldCup }: { worldCup: TWorldCup }) => {
	const champion = worldCup.champion as ITeamMatch;

	useEffect(() => {
		if (!worldCup.isCurrent) return;
		const end = Date.now() + 4.5 * 1000;
		const colors = [champion.color || '#D4AF37', '#ffffff'];
		let frameId = 0;
		(function frame() {
			confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors });
			confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }, colors });
			if (Date.now() < end) frameId = requestAnimationFrame(frame);
		})();
		return () => cancelAnimationFrame(frameId);
	}, [worldCup.isCurrent, champion.color]);

	return (
		<>
			<div className={styles.champion}>
				<h2>Champion ✨</h2>
				<div className={styles.champion_badge_wrapper}>
					<ClubBadge className={styles.champion_badge} {...champion} />
					<img className={styles.champion_trophy} src={worldCupTrophy} alt='World Cup' />
				</div>
				<p>{champion.name}</p>
			</div>
			<div
				className={styles.bg_gradient}
				style={{ background: `linear-gradient(180deg, #171717 40%, ${champion.color} 159.3%)` }}
			/>
		</>
	);
};

export const Knockout = ({ worldCup }: { worldCup: TWorldCup }) => {
	const { myClub, dispatch } = useContext(SeassonContext);
	const [isLoading, setIsLoading] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout>>();
	useEffect(() => () => clearTimeout(timer.current), []);

	const wid = worldCup.uuid;
	const round = getCurrentRound(worldCup);
	const roundDone = round.length > 0 && round.every(match => match.status === 'DONE');
	const pendingOthers = round.some(
		match => match.status === 'TODO' && !(myClub && isMyClub(match, myClub)),
	);

	const simulate = () => {
		setIsLoading(true);
		timer.current = setTimeout(() => {
			dispatch({ type: '[WORLDCUP] - SIMULATE ROUND', payload: { wid } });
			setIsLoading(false);
		}, SIMULATE_DELAY_MS);
	};
	const next = () => dispatch({ type: '[WORLDCUP] - NEXT ROUND', payload: { wid } });

	const renderAction = () => {
		if (isLoading) {
			return (
				<Button.Primary className={styles.button_main} onClick={() => undefined}>
					Simulating...
				</Button.Primary>
			);
		}
		if (pendingOthers) {
			return (
				<Button.Primary className={styles.button_main} onClick={simulate}>
					Simulate
				</Button.Primary>
			);
		}
		if (roundDone) {
			return (
				<Button.Primary className={styles.button_main} onClick={next}>
					{worldCup.stage === 'FINAL' ? 'See the champion' : 'Next'}
				</Button.Primary>
			);
		}
		return <p className={styles.hint}>Tap your match ⭐ to enter your score</p>;
	};

	return (
		<div className={styles.content}>
			<h2 className={styles.stage_title}>{ROUND_TITLE[worldCup.stage]}</h2>
			<Bracket worldCup={worldCup} />

			<div className={styles.section}>
				<ul className={styles.match_list}>
					{round.map(match => (
						<WorldCupMatch key={match.uuid} wid={wid} match={match} knockout />
					))}
				</ul>
				<div className={styles.actions}>{renderAction()}</div>
			</div>

			<details className={styles.details}>
				<summary>Group stage</summary>
				<GroupTables worldCup={worldCup} />
			</details>
		</div>
	);
};
