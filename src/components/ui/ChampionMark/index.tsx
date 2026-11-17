import { CSSProperties, ReactNode, useLayoutEffect, useRef, useState } from 'react';
import { useChampionTitles } from '../../../hooks/useWorldCupChampion';
import worldCupTrophy from '../../../assets/wp-thropy.png';
import leagueTrophy from '../../../assets/champion.png';
import supercupTrophy from '../../../assets/supercup.png';
import { TChampionKind } from '../../../helpers/champions';
import styles from './styles.module.css';

const MARK: Record<TChampionKind, { image: string; className: string; dot: string }> = {
	WORLD_CUP: { image: worldCupTrophy, className: styles.mark_world_cup, dot: styles.dot_world_cup },
	LEAGUE: { image: leagueTrophy, className: styles.mark_league, dot: styles.dot_league },
	SUPERCUP: { image: supercupTrophy, className: styles.mark_supercup, dot: styles.dot_supercup },
};

/** Crests narrower than this get small colored dots instead of trophy badges. */
const COMPACT_BELOW = 32;

interface IChampionMark {
	/** Club the crest belongs to. */
	uuid?: string;
	children: ReactNode;
	/** Set to false where the marks would be redundant or too small. */
	enabled?: boolean;
}

/**
 * Wraps a crest and marks the titles the club currently holds (defending
 * World Cup champion, last league and supercup champion).
 * - Big crests: one trophy badge per title, staggered on the bottom-right
 *   corner, World Cup on top.
 * - Small crests: a row of colored dots under the crest, so the crest stays
 *   fully visible.
 * Clubs without titles are rendered untouched (no wrapper).
 */
export const ChampionMark = ({ uuid, children, enabled = true }: IChampionMark) => {
	const titles = useChampionTitles(enabled ? uuid : undefined);
	const wrapRef = useRef<HTMLSpanElement>(null);
	const [compact, setCompact] = useState(false);

	// The crest size comes from each page's CSS, so measure it (before paint).
	useLayoutEffect(() => {
		const node = wrapRef.current;
		if (!node) return;
		const update = () => setCompact(node.offsetWidth < COMPACT_BELOW);
		update();
		if (typeof ResizeObserver === 'undefined') return;
		const observer = new ResizeObserver(update);
		observer.observe(node);
		return () => observer.disconnect();
	}, [titles.length]);

	if (titles.length === 0) return <>{children}</>;
	const label = titles.map(t => t.label).join(' · ');

	return (
		<span ref={wrapRef} className={styles.wrap} title={label}>
			{children}
			{compact ? (
				<span className={styles.dots} role='img' aria-label={label}>
					{titles.map(title => (
						<span key={title.kind} className={`${styles.dot} ${MARK[title.kind].dot}`} />
					))}
				</span>
			) : (
				titles.map((title, i) => (
					<span
						key={title.kind}
						className={`${styles.mark} ${MARK[title.kind].className}`}
						role='img'
						aria-label={title.label}
						style={
							{
								backgroundImage: `url(${MARK[title.kind].image})`,
								// Each extra badge sits a bit further left, under the previous one.
								right: `calc(-8% + ${i * 24}%)`,
								zIndex: titles.length - i,
							} as CSSProperties
						}
					/>
				))
			)}
		</span>
	);
};
