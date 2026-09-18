import { getInitials } from '../ItemClub';
import styles from './styles.module.css';

interface IClubBadge {
	image?: string;
	name: string;
	color?: string;
	className?: string;
}
export const ClubBadge = ({ image, name, color, className = '' }: IClubBadge) => {
	if (image) {
		return <img className={`${styles.image} ${className}`} src={image} alt={name} />;
	}
	return (
		<span
			className={`${styles.badge} ${className}`}
			style={{ backgroundColor: color || '#555' }}>
			{getInitials(name)}
		</span>
	);
};
