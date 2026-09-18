import styles from './styles.module.css';

export interface IItemClub {
	image?: string;
	name: string;
	color?: string;
	className?: string;
}

export const getInitials = (name: string) =>
	name
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map(word => word[0])
		.join('')
		.toUpperCase();

export const ItemClub = ({ image, name, color, className = '' }: IItemClub) => {
	return (
		<div className={`${styles.item_club} ${className}`}>
			{image ? (
				<img src={image} />
			) : (
				<span className={styles.badge} style={{ backgroundColor: color || '#555' }}>
					{getInitials(name)}
				</span>
			)}
			<p>{name}</p>
		</div>
	);
};
