import { getInitials } from '../ItemClub';
import { ChampionMark } from '../ChampionMark';
import styles from './styles.module.css';

interface IClubBadge {
	uuid?: string;
	image?: string;
	name: string;
	color?: string;
	className?: string;
	/** Show the World Cup champion mark when this is the defending champion. */
	showChampion?: boolean;
}
export const ClubBadge = ({ uuid, image, name, color, className = '', showChampion = true }: IClubBadge) => {
	const crest = image ? (
		<img className={`${styles.image} ${className}`} src={image} alt={name} />
	) : (
		<span
			className={`${styles.badge} ${className}`}
			style={{ backgroundColor: color || '#555' }}>
			{getInitials(name)}
		</span>
	);
	return (
		<ChampionMark uuid={uuid} enabled={showChampion}>
			{crest}
		</ChampionMark>
	);
};
