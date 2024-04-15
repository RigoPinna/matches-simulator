import { ReactNode } from 'react';
import styles from './styles.module.css';

interface IHeader {
	children: ReactNode;
	className?: string;
}
export const Header = ({ children, className = '' }: IHeader) => {
	return (
		<header className={`${styles.header} ${className}`}>
			<div className={styles.container}>{children}</div>
		</header>
	);
};
