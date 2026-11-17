import { CSSProperties, ReactNode } from 'react';
import { useChampionTitles } from '../../../hooks/useWorldCupChampion';
import worldCupTrophy from '../../../assets/wp-thropy.png';
import leagueTrophy from '../../../assets/champion.png';
import supercupTrophy from '../../../assets/supercup.png';
import { TChampionKind } from '../../../helpers/champions';
import styles from './styles.module.css';

const MARK: Record<TChampionKind, { image: string; className: string }> = {
	WORLD_CUP: { image: worldCupTrophy, className: styles.mark_world_cup },
	LEAGUE: { image: leagueTrophy, className: styles.mark_league },
	SUPERCUP: { image: supercupTrophy, className: styles.mark_supercup },
};

interface IChampionMark {
	/** Club the crest belongs to. */
	uuid?: string;
	children: ReactNode;
	/** Set to false where the marks would be redundant or too small. */
	enabled?: boolean;
}

/**
 * Wraps a crest and adds a small badge per title the club currently holds
 * (defending World Cup champion, last league and supercup champion). Several badges
 * stack on the bottom-right corner, World Cup on top. Clubs without titles
 * are rendered untouched (no wrapper), so their layout never changes.
 */
export const ChampionMark = ({ uuid, children, enabled = true }: IChampionMark) => {
	const titles = useChampionTitles(enabled ? uuid : undefined);
	if (titles.length === 0) return <>{children}</>;
	return (
		<span className={styles.wrap} title={titles.map(t => t.label).join(' · ')}>
			{children}
			{titles.map((title, i) => (
				<span
					key={title.kind}
					className={`${styles.mark} ${MARK[title.kind].className}`}
					role='img'
					aria-label={title.label}
					style={
						{
							backgroundImage: `url(${MARK[title.kind].image})`,
							// Each extra badge sits a bit further left, under the previous one.
							right: `calc(-12% + ${i * 30}%)`,
							zIndex: titles.length - i,
						} as CSSProperties
					}
				/>
			))}
		</span>
	);
};
