import { useState } from 'react';
import { Fire, Star } from '../../components/icons';
import styles from './guide.module.css';

const STORAGE_KEY = 'journeyGuideDismissed';

const readDismissed = () => {
	try {
		return localStorage.getItem(STORAGE_KEY) === '1';
	} catch {
		return false;
	}
};

/**
 * How to play a journey, shown once above the journeys instead of repeating
 * a hint on every match. "Got it" hides it (remembered in this browser only).
 */
export const JourneyGuide = () => {
	const [dismissed, setDismissed] = useState(readDismissed);
	if (dismissed) return null;

	const dismiss = () => {
		setDismissed(true);
		try {
			localStorage.setItem(STORAGE_KEY, '1');
		} catch {
			// Storage unavailable (private mode...): it just shows again next time.
		}
	};

	return (
		<aside className={styles.guide} aria-label='How to play a journey'>
			<h3>How to play a journey</h3>
			<ol>
				<li>
					<span className={styles.icon}>
						<Fire />
					</span>
					<span>
						<strong>Simulate</strong> plays the other matches of the journey.
					</span>
				</li>
				<li>
					<span className={styles.icon}>
						<Star />
					</span>
					<span>
						Your match is marked with a star: <strong>tap it</strong> to enter the score.
					</span>
				</li>
				<li>
					<span className={styles.icon}>✓</span>
					<span>The journey ends when every match has a result.</span>
				</li>
			</ol>
			<button type='button' className={styles.dismiss} onClick={dismiss}>
				Got it
			</button>
		</aside>
	);
};
