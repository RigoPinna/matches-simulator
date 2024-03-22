import { ReactNode } from 'react';
import styles from './styles.module.css';

interface IHeader {
	children: ReactNode;
}
export const Header = ({ children }: IHeader) => {
	return (
		<header className={styles.header}>
			<div className={styles.container}>{children}</div>
		</header>
	);
};
