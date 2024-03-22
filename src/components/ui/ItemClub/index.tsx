import styles from './styles.module.css';

interface IItemClub {
	image: string;
	name: string;
	className?: string;
}
export const ItemClub = ({ image, name, className = '' }: IItemClub) => {
	return (
		<div className={`${styles.item_club} ${className}`}>
			<img src={image} />
			<p>{name}</p>
		</div>
	);
};
