import { IClub } from '../../store';
import leagueTrophy from '../../assets/champion.png';
import supercupTrophy from '../../assets/supercup.png';
import worldCupTrophy from '../../assets/wp-thropy.png';
import styles from './styles.module.css';

type TTile = { key: keyof IClub; label: string; image: string; worldCup?: boolean };

interface IClubTrophies {
	club: IClub;
	/** Mexican club (Primera / Plate) — international clubs have no Plate titles. */
	isMexican: boolean;
	/** Has played (or won something) in Plate Ligue. */
	showPlate: boolean;
}

/** Every trophy that applies to the club; the ones not won yet are dimmed. */
export const ClubTrophies = ({ club, isMexican, showPlate }: IClubTrophies) => {
	const tiles: TTile[] = [
		{ key: 'champions', label: isMexican ? 'Primera titles' : 'League titles', image: leagueTrophy },
		{ key: 'supercups', label: 'Supercups', image: supercupTrophy },
		...(isMexican && showPlate
			? [
				{ key: 'plateChampions' as const, label: 'Plate titles', image: leagueTrophy },
				{ key: 'plateSupercups' as const, label: 'Plate supercups', image: supercupTrophy },
			]
			: []),
		{ key: 'worldCups', label: 'World Cups', image: worldCupTrophy, worldCup: true },
	];
	return (
		<ul className={styles.trophies} aria-label='Trophies'>
			{tiles.map(tile => {
				const count = (club[tile.key] as number | undefined) || 0;
				return (
					<li key={tile.key} className={`${styles.tile} ${count === 0 ? styles.tile_empty : ''}`}>
						<p className={styles.tile_count}>{count}</p>
						<h3 className={styles.tile_title}>{tile.label}</h3>
						<img
							src={tile.image}
							alt=''
							className={`${styles.tile_image} ${tile.worldCup ? styles.tile_image_wc : ''}`}
						/>
					</li>
				);
			})}
		</ul>
	);
};
