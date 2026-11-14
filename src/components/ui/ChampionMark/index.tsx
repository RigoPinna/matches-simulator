import { CSSProperties, ReactNode } from 'react';
import { useWorldCupChampionUuid } from '../../../hooks/useWorldCupChampion';
import worldCupTrophy from '../../../assets/wp-thropy.png';
import styles from './styles.module.css';

interface IChampionMark {
	/** Club the crest belongs to. */
	uuid?: string;
	children: ReactNode;
	/** Set to false where the mark would be redundant or too small. */
	enabled?: boolean;
}

/**
 * Wraps a crest and, if the club is the defending World Cup champion, adds a
 * small trophy badge on its bottom-right corner. Other clubs are rendered
 * untouched (no wrapper), so their layout never changes.
 */
export const ChampionMark = ({ uuid, children, enabled = true }: IChampionMark) => {
	const championUuid = useWorldCupChampionUuid();
	if (!enabled || !uuid || uuid !== championUuid) return <>{children}</>;
	return (
		<span className={styles.wrap} title='World Cup champion'>
			{children}
			<span
				className={styles.mark}
				role='img'
				aria-label='World Cup champion'
				style={{ backgroundImage: `url(${worldCupTrophy})` } as CSSProperties}
			/>
		</span>
	);
};
