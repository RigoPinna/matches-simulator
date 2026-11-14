import { ChampionMark } from '../ChampionMark';
import styles from './styles.module.css';

export interface IItemClub {
	uuid?: string;
	image?: string;
	name: string;
	color?: string;
	className?: string;
	/** Show the World Cup champion mark when this is the defending champion. */
	showChampion?: boolean;
}

export const getInitials = (name: string) =>
	name
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map(word => word[0])
		.join('')
		.toUpperCase();

export const ItemClub = ({ uuid, image, name, color, className = '', showChampion = true }: IItemClub) => {
	return (
		<div className={`${styles.item_club} ${className}`}>
			<ChampionMark uuid={uuid} enabled={showChampion}>
				{image ? (
					<img src={image} />
				) : (
					<span className={styles.badge} style={{ backgroundColor: color || '#555' }}>
						{getInitials(name)}
					</span>
				)}
			</ChampionMark>
			<p>{name}</p>
		</div>
	);
};
