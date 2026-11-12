import { useContext, useEffect, useMemo, useState } from 'react';
import {
	LEAGUE_INFO,
	QUALIFIERS_PER_LEAGUE,
	SeassonContext,
	TWorldCup,
	TWorldCupQualifier,
} from '../../store';
import { GROUP_NAMES } from '../../helpers';
import { Button, ClubBadge, ItemClub } from '../../components/ui';
import { DrawBowl } from './DrawBowl';
import styles from './styles.module.css';

const SPIN_MS = 750;
const REVEAL_MS = 1150;

type TPhase = 'spinning' | 'reveal';

export const GroupDraw = ({ worldCup }: { worldCup: TWorldCup }) => {
	const { dispatch } = useContext(SeassonContext);
	const steps = worldCup.groupDraw;
	const drawn = worldCup.groups.length > 0;
	// How many clubs have already landed in their group.
	const [revealed, setRevealed] = useState(0);
	const [phase, setPhase] = useState<TPhase>('spinning');
	const animating = drawn && revealed < steps.length;

	const byUuid = useMemo(
		() => new Map(worldCup.qualifiers.map(q => [q.club.uuid, q])),
		[worldCup.qualifiers],
	);
	const pots = useMemo(
		() =>
			Array.from({ length: QUALIFIERS_PER_LEAGUE }, (_, i) =>
				worldCup.qualifiers.filter(q => q.position === i + 1),
			),
		[worldCup.qualifiers],
	);

	useEffect(() => {
		if (!animating) return;
		const id = setTimeout(
			() => {
				if (phase === 'spinning') {
					setPhase('reveal');
				} else {
					setPhase('spinning');
					setRevealed(r => r + 1);
				}
			},
			phase === 'spinning' ? SPIN_MS : REVEAL_MS,
		);
		return () => clearTimeout(id);
	}, [animating, phase, revealed]);

	const drawnUuids = new Set(steps.slice(0, revealed).map(step => step.clubUuid));
	// While revealing, the club on the card is already "out" of the pot.
	if (animating && phase === 'reveal') drawnUuids.add(steps[revealed].clubUuid);
	const current = animating ? steps[revealed] : undefined;
	const currentQualifier = current ? byUuid.get(current.clubUuid) : undefined;
	const remainingKey = worldCup.qualifiers
		.filter(q => !drawnUuids.has(q.club.uuid))
		.map(q => q.club.uuid)
		.join(',');
	// Stable array while nobody is drawn, so the bowl doesn't resync every render.
	const remainingClubs = useMemo(
		() => worldCup.qualifiers.filter(q => remainingKey.split(',').includes(q.club.uuid)).map(q => q.club),
		[remainingKey, worldCup.qualifiers],
	);

	const startDraw = () => {
		setRevealed(0);
		setPhase('spinning');
		dispatch({ type: '[WORLDCUP] - DRAW GROUPS', payload: { wid: worldCup.uuid } });
	};
	const replay = () => {
		setRevealed(0);
		setPhase('spinning');
	};
	const skip = () => setRevealed(steps.length);
	const startGroups = () =>
		dispatch({ type: '[WORLDCUP] - START GROUPS', payload: { wid: worldCup.uuid } });

	const renderPotClub = (q: TWorldCupQualifier) => (
		<div
			key={q.club.uuid}
			className={`${styles.pot_club} ${drawn && drawnUuids.has(q.club.uuid) ? styles.pot_club_drawn : ''}`}>
			<ClubBadge className={styles.badge_sm} {...q.club} />
			<span>{q.club.name}</span>
		</div>
	);

	return (
		<>
			<h2 className={styles.stage_title}>Group draw</h2>
			<p className={styles.hint}>
				Pot = league position. Each group gets one club per pot and never two clubs from the
				same league.
			</p>

			<div className={styles.draw_stage}>
				<DrawBowl clubs={remainingClubs} spinning={animating && phase === 'spinning'} />
				{phase === 'reveal' && current && currentQualifier && (
					<div className={styles.reveal_card} key={current.clubUuid}>
						<ClubBadge className={styles.badge_lg} {...currentQualifier.club} />
						<strong>{currentQualifier.club.name}</strong>
						<span>
							{LEAGUE_INFO[currentQualifier.league].name} · #{currentQualifier.position}
						</span>
						<span className={styles.reveal_group}>→ Group {current.group}</span>
					</div>
				)}
			</div>

			<div className={styles.pots}>
				{pots.map((pot, i) => (
					<div
						key={`pot-${i}`}
						className={`${styles.pot} ${current?.pot === i + 1 ? styles.pot_active : ''}`}>
						<span className={styles.pot_label}>Pot {i + 1}</span>
						<div className={styles.pot_clubs}>{pot.map(renderPotClub)}</div>
					</div>
				))}
			</div>

			{drawn && (
				<div className={styles.groups_grid}>
					{GROUP_NAMES.map(name => (
						<div
							key={name}
							className={`${styles.group_card} ${current?.group === name && phase === 'reveal' ? styles.group_card_active : ''}`}>
							<h4>Group {name}</h4>
							{Array.from({ length: QUALIFIERS_PER_LEAGUE }, (_, potIndex) => {
								const step = steps
									.slice(0, revealed)
									.find(s => s.group === name && s.pot === potIndex + 1);
								const q = step && byUuid.get(step.clubUuid);
								return q ? (
									<div key={potIndex} className={`${styles.slot} ${styles.slot_filled}`}>
										<ItemClub {...q.club} />
									</div>
								) : (
									<div key={potIndex} className={`${styles.slot} ${styles.slot_empty}`}>
										Pot {potIndex + 1}
									</div>
								);
							})}
						</div>
					))}
				</div>
			)}

			<div className={styles.actions}>
				{!drawn && (
					<Button.Primary className={styles.button_main} onClick={startDraw}>
						Start draw
					</Button.Primary>
				)}
				{animating && (
					<Button.Secondary className={styles.button_secondary} onClick={skip}>
						Skip animation
					</Button.Secondary>
				)}
				{drawn && !animating && (
					<>
						<Button.Primary className={styles.button_main} onClick={startGroups}>
							Continue
						</Button.Primary>
						<Button.Secondary className={styles.button_secondary} onClick={replay}>
							Replay draw
						</Button.Secondary>
					</>
				)}
			</div>
		</>
	);
};
