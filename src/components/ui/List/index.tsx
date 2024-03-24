import { MouseEvent, ReactNode } from 'react';
import styles from './styles.module.css';
import { ArrowRight } from '../../icons';

type TItemList = {
	className?: string;
	children: ReactNode;
	onClick?: (evt: MouseEvent<HTMLElement>) => void;
};

const Item = ({ children, onClick, className = '' }: TItemList) => {
	return (
		<li className={styles.list_item} style={{ cursor: onClick ? 'pointer' : '' }}>
			<div className={`${styles.wrapper_item} ${className}`}>{children}</div>
			{onClick && (
				<div className={styles.icon}>
					<ArrowRight />
				</div>
			)}
		</li>
	);
};

type TContainerList = {
	title?: string;
	children: ReactNode;
	className?: string;
};
const Container = ({ children, title, className = '' }: TContainerList) => {
	return (
		<div className={`${styles.container} ${className}`}>
			{title && <p className={styles.title}>{title}</p>}
			<ul className={styles.list}>{children}</ul>
		</div>
	);
};

const List = {
	Container,
	Item,
};
export default List;
