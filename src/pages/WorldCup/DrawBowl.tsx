import { useEffect, useRef } from 'react';
import { IClub } from '../../store';
import { ClubBadge } from '../../components/ui';
import styles from './styles.module.css';

/** Bowl size in px (must match .bowl in styles.module.css). */
const BOWL_SIZE = 170;
const BALL_SIZE = 26;
const BOWL_BORDER = 3;

const R = BOWL_SIZE / 2 - BOWL_BORDER; // inner radius
const r = BALL_SIZE / 2;
const MAX_DIST = R - r; // max distance of a ball center from the bowl center

const GRAVITY = 1400; // px/s²
const AIR_DAMPING = 0.6; // per second
const WALL_RESTITUTION = 0.45;
const BALL_RESTITUTION = 0.8;
const WALL_FRICTION = 0.25; // how much the spinning wall drags the ball each contact
const SPIN_SPEED = 7; // rad/s of the bowl wall while spinning
const JET_CHANCE = 2.4; // air-jet kicks per ball per second while spinning
const SUBSTEPS = 3;

type TBody = { x: number; y: number; vx: number; vy: number; angle: number; spin: number };

const randomBody = (): TBody => {
	// Start somewhere in the lower half; collisions sort out any overlap.
	const a = Math.PI * (0.15 + Math.random() * 0.7);
	const d = Math.random() * MAX_DIST * 0.8;
	return { x: Math.cos(a) * d, y: Math.sin(a) * d, vx: 0, vy: 0, angle: Math.random() * 360, spin: 0 };
};

const step = (bodies: TBody[], dt: number, spinning: boolean) => {
	const omega = spinning ? SPIN_SPEED : 0;
	for (const b of bodies) {
		b.vy += GRAVITY * dt;
		if (spinning && Math.random() < JET_CHANCE * dt) {
			// Air jet from below, like a real lottery machine.
			b.vx += (Math.random() - 0.5) * 420;
			b.vy -= 260 + Math.random() * 380;
		}
		const damping = 1 - AIR_DAMPING * dt;
		b.vx *= damping;
		b.vy *= damping;
		b.x += b.vx * dt;
		b.y += b.vy * dt;
		b.angle += (b.spin * dt * 180) / Math.PI;

		// Wall: keep inside the circle, bounce, and get dragged by the spin.
		const dist = Math.hypot(b.x, b.y);
		if (dist > MAX_DIST) {
			const nx = b.x / dist;
			const ny = b.y / dist;
			b.x = nx * MAX_DIST;
			b.y = ny * MAX_DIST;
			const vn = b.vx * nx + b.vy * ny;
			if (vn > 0) {
				b.vx -= (1 + WALL_RESTITUTION) * vn * nx;
				b.vy -= (1 + WALL_RESTITUTION) * vn * ny;
			}
			const tx = -ny;
			const ty = nx;
			const vt = b.vx * tx + b.vy * ty;
			const target = vt + (omega * MAX_DIST - vt) * WALL_FRICTION;
			b.vx += (target - vt) * tx;
			b.vy += (target - vt) * ty;
			b.spin = target / r; // rolls along the wall
		} else {
			b.spin *= 1 - 0.5 * dt;
		}
	}

	// Ball-ball collisions (equal mass).
	for (let i = 0; i < bodies.length; i++) {
		for (let j = i + 1; j < bodies.length; j++) {
			const a = bodies[i];
			const b = bodies[j];
			const dx = b.x - a.x;
			const dy = b.y - a.y;
			const dist = Math.hypot(dx, dy) || 0.001;
			const overlap = 2 * r - dist;
			if (overlap <= 0) continue;
			const nx = dx / dist;
			const ny = dy / dist;
			a.x -= (nx * overlap) / 2;
			a.y -= (ny * overlap) / 2;
			b.x += (nx * overlap) / 2;
			b.y += (ny * overlap) / 2;
			const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
			if (rel < 0) {
				const impulse = (-(1 + BALL_RESTITUTION) * rel) / 2;
				a.vx -= impulse * nx;
				a.vy -= impulse * ny;
				b.vx += impulse * nx;
				b.vy += impulse * ny;
			}
		}
	}
};

interface IDrawBowl {
	/** Clubs still in the bowl. */
	clubs: IClub[];
	spinning: boolean;
}

/**
 * Lottery bowl whose balls are the clubs' crests, with simple 2D physics:
 * gravity piles them at the bottom; while spinning, the wall drags them up
 * and air jets toss them around before they fall back.
 */
export const DrawBowl = ({ clubs, spinning }: IDrawBowl) => {
	const bodies = useRef(new Map<string, TBody>());
	const nodes = useRef(new Map<string, HTMLDivElement>());
	const spinningRef = useRef(spinning);
	spinningRef.current = spinning;

	// Keep one body per club in the bowl.
	useEffect(() => {
		const uuids = new Set(clubs.map(club => club.uuid));
		for (const uuid of [...bodies.current.keys()]) {
			if (!uuids.has(uuid)) bodies.current.delete(uuid);
		}
		for (const club of clubs) {
			if (!bodies.current.has(club.uuid)) bodies.current.set(club.uuid, randomBody());
		}
	}, [clubs]);

	useEffect(() => {
		const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
		let frame = 0;
		let last = performance.now();
		const loop = (now: number) => {
			const dt = Math.min((now - last) / 1000, 1 / 30);
			last = now;
			const list = [...bodies.current.values()];
			const spin = spinningRef.current && !reducedMotion;
			for (let s = 0; s < SUBSTEPS; s++) step(list, dt / SUBSTEPS, spin);
			for (const [uuid, body] of bodies.current) {
				const node = nodes.current.get(uuid);
				if (!node) continue;
				node.style.transform = `translate(${body.x + R - r + BOWL_BORDER}px, ${body.y + R - r + BOWL_BORDER}px) rotate(${body.angle}deg)`;
			}
			frame = requestAnimationFrame(loop);
		};
		frame = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(frame);
	}, []);

	return (
		<div className={styles.bowl}>
			<div className={`${styles.bowl_ring} ${spinning ? styles.bowl_ring_spin : ''}`} />
			{clubs.map(club => (
				<div
					key={club.uuid}
					className={styles.ball}
					ref={node => {
						if (node) nodes.current.set(club.uuid, node);
						else nodes.current.delete(club.uuid);
					}}>
					<ClubBadge className={styles.ball_crest} {...club} />
				</div>
			))}
			<div className={styles.bowl_glass} />
		</div>
	);
};
