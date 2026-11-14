import { ChangeEvent, CSSProperties, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { IClub, SeassonContext, TSeason } from '../../store';
import { getStandingsFrames, ordinal } from '../../helpers';
import { getInitials } from '../../components/ui/ItemClub';
import { ClubBadge } from '../../components/ui';
import styles from './race.module.css';

/** Time it takes to draw one journey while playing. */
const STEP_MS = 900;
const W = 340;
const ROW = 30;
const PAD = { top: 16, right: 22, bottom: 26, left: 34 };
const HEAD_R = 10;

const PlayIcon = () => (
	<svg width='12' height='12' viewBox='0 0 12 12' aria-hidden='true'>
		<path d='M2.5 1.2v9.6L10.5 6z' fill='currentColor' />
	</svg>
);
const PauseIcon = () => (
	<svg width='12' height='12' viewBox='0 0 12 12' aria-hidden='true'>
		<path d='M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z' fill='currentColor' />
	</svg>
);

/** Lighter version of the club color, so dark colors stay visible on the dark card. */
const lineColor = (club: IClub) => `color-mix(in srgb, ${club.color} 75%, #ffffff)`;

/**
 * "Season replay": one line per club with its table position after every
 * journey (1st at the top). Play draws all lines journey by journey.
 */
export const StandingsRace = ({ season }: { season: TSeason }) => {
	const { myClub } = useContext(SeassonContext);
	const frames = useMemo(() => getStandingsFrames(season), [season]);
	const journeys = frames.length - 1;
	const clubs = season.table.map(row => row.club);
	const teams = clubs.length;

	/** Position (0-based) of each club after journey j, for j = 1..journeys. */
	const positions = useMemo(() => {
		const map = new Map<string, number[]>();
		for (const frame of frames) {
			for (const row of frame.rows) {
				if (!map.has(row.club.uuid)) map.set(row.club.uuid, []);
				map.get(row.club.uuid)![frame.journey] = row.position;
			}
		}
		return map;
	}, [frames]);

	// Continuous progress in journeys (1..journeys); starts on the final table.
	// Mirrored in a ref so the animation loop reads it synchronously.
	const [t, setTState] = useState(journeys);
	const tRef = useRef(journeys);
	const setT = (value: number) => {
		tRef.current = value;
		setTState(value);
	};
	const [playing, setPlaying] = useState(false);
	const [selected, setSelected] = useState<string | null>(null);

	useEffect(() => {
		tRef.current = journeys;
		setTState(journeys);
	}, [journeys]);

	useEffect(() => {
		if (!playing) return;
		const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
		const advance = (next: number) => {
			const clamped = Math.min(journeys, next);
			tRef.current = clamped;
			setTState(clamped);
			if (clamped >= journeys) setPlaying(false);
			return clamped < journeys;
		};
		if (reducedMotion) {
			// Jump journey by journey instead of drawing continuously.
			const id = setInterval(() => {
				if (!advance(Math.floor(tRef.current) + 1)) clearInterval(id);
			}, STEP_MS);
			return () => clearInterval(id);
		}
		let frame = 0;
		let last = performance.now();
		const loop = (now: number) => {
			const keepGoing = advance(tRef.current + (now - last) / STEP_MS);
			last = now;
			if (keepGoing) frame = requestAnimationFrame(loop);
		};
		frame = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(frame);
	}, [playing, journeys]);

	if (journeys < 1) return null;

	const innerW = W - PAD.left - PAD.right;
	const H = PAD.top + (teams - 1) * ROW + PAD.bottom;
	const x = (j: number) => PAD.left + (journeys === 1 ? innerW : ((j - 1) / (journeys - 1)) * innerW);
	const y = (pos: number) => PAD.top + pos * ROW;

	/** Points of a club's line up to progress t (last segment interpolated). */
	const linePoints = (uuid: string): [number, number][] => {
		const pos = positions.get(uuid)!;
		const whole = Math.floor(t);
		const points: [number, number][] = [];
		for (let j = 1; j <= whole; j++) points.push([x(j), y(pos[j])]);
		const frac = t - whole;
		if (frac > 0 && whole < journeys) {
			const from = pos[whole];
			const to = pos[whole + 1];
			points.push([x(whole) + (x(whole + 1) - x(whole)) * frac, y(from + (to - from) * frac)]);
		}
		return points;
	};

	const togglePlay = () => {
		if (playing) {
			setPlaying(false);
			return;
		}
		if (t >= journeys) setT(1);
		setPlaying(true);
	};
	const onScrub = ({ target }: ChangeEvent<HTMLInputElement>) => {
		setPlaying(false);
		setT(Number(target.value));
	};

	const shownJourney = Math.max(1, Math.round(t));
	const table = frames[shownJourney].rows;
	const finished = t >= journeys;
	const labelEvery = Math.ceil(journeys / 7);
	// Selected club (or yours, by default) is drawn last so it sits on top.
	const focus = selected ?? myClub?.uuid;
	const drawOrder = [...clubs].sort((a, b) => Number(a.uuid === focus) - Number(b.uuid === focus));

	return (
		<section className={styles.race}>
			<div className={styles.head}>
				<div>
					<h3>Season replay</h3>
					<p aria-live='polite'>
						Journey {shownJourney} of {journeys}
					</p>
				</div>
				<button
					type='button'
					className={styles.play}
					onClick={togglePlay}
					aria-label={playing ? 'Pause replay' : 'Play replay'}>
					{playing ? <PauseIcon /> : <PlayIcon />}
					{playing ? 'Pause' : finished ? 'Play' : 'Resume'}
				</button>
			</div>

			<svg
				className={styles.chart}
				viewBox={`0 0 ${W} ${H}`}
				role='img'
				aria-label={`Table position of each club after every journey, up to journey ${shownJourney}`}>
				{/* Position grid */}
				{Array.from({ length: teams }, (_, pos) => (
					<g key={pos}>
						<line x1={PAD.left} x2={W - PAD.right} y1={y(pos)} y2={y(pos)} className={styles.grid} />
						<text x={PAD.left - 16} y={y(pos) + 3.5} className={styles.axis} textAnchor='end'>
							{ordinal(pos + 1)}
						</text>
					</g>
				))}
				{/* Journey axis */}
				{Array.from({ length: journeys }, (_, i) => i + 1)
					.filter(j => j === 1 || j === journeys || (j % labelEvery === 0 && journeys - j >= labelEvery / 2))
					.map(j => (
						<text key={j} x={x(j)} y={H - 6} className={styles.axis} textAnchor='middle'>
							{j}
						</text>
					))}
				{/* Progress marker */}
				<line
					x1={x(Math.max(1, t))}
					x2={x(Math.max(1, t))}
					y1={PAD.top - 8}
					y2={y(teams - 1) + 8}
					className={styles.cursor}
				/>

				{drawOrder.map(club => {
					const points = linePoints(club.uuid);
					if (points.length === 0) return null;
					const [hx, hy] = points[points.length - 1];
					const dimmed = selected !== null && selected !== club.uuid;
					const strong = club.uuid === focus;
					return (
						<g
							key={club.uuid}
							className={`${styles.series} ${dimmed ? styles.dimmed : ''}`}
							onClick={() => setSelected(s => (s === club.uuid ? null : club.uuid))}>
							<polyline
								points={points.map(p => p.join(',')).join(' ')}
								className={styles.line}
								style={{ stroke: lineColor(club), strokeWidth: strong ? 3.5 : 2 }}
							/>
							<circle cx={hx} cy={hy} r={HEAD_R} className={styles.head_bg} style={{ stroke: lineColor(club) }} />
							{club.image ? (
								<image
									href={club.image}
									x={hx - HEAD_R + 3}
									y={hy - HEAD_R + 3}
									width={(HEAD_R - 3) * 2}
									height={(HEAD_R - 3) * 2}
									preserveAspectRatio='xMidYMid meet'
								/>
							) : (
								<text x={hx} y={hy + 2.5} className={styles.initials} textAnchor='middle'>
									{getInitials(club.name)}
								</text>
							)}
						</g>
					);
				})}
			</svg>

			<input
				className={styles.scrubber}
				type='range'
				min={1}
				max={journeys}
				step={1}
				value={shownJourney}
				onChange={onScrub}
				aria-label='Journey'
				style={{ '--progress': `${((t - 1) / Math.max(1, journeys - 1)) * 100}%` } as CSSProperties}
			/>

			{/* Table at the current journey; tapping a club highlights its line. */}
			<ol className={styles.table}>
				{table.map(row => {
					const mine = row.club.uuid === myClub?.uuid;
					const isSelected = selected === row.club.uuid;
					return (
						<li key={row.club.uuid}>
							<button
								type='button'
								className={`${styles.entry} ${isSelected ? styles.entry_selected : ''} ${selected && !isSelected ? styles.entry_dimmed : ''}`}
								onClick={() => setSelected(s => (s === row.club.uuid ? null : row.club.uuid))}
								aria-pressed={isSelected}>
								<span className={styles.entry_pos}>{row.position + 1}</span>
								<span className={styles.swatch} style={{ background: lineColor(row.club) }} />
								<ClubBadge className={styles.entry_crest} {...row.club} />
								<span className={`${styles.entry_name} ${mine ? styles.mine : ''}`}>
									{row.club.name}
									{finished && row.position === 0 && ' 🏆'}
								</span>
								<span className={styles.entry_pts}>{row.pts}</span>
							</button>
						</li>
					);
				})}
			</ol>
		</section>
	);
};
