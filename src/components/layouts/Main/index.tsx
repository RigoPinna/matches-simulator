import { ReactNode } from 'react';
import styles from './styles.module.css';
interface IMain {
	children: ReactNode;
}
export const Main = ({ children }: IMain) => {
	return (
		<main className={styles.main}>
			<div className={styles.container}>{children}</div>
		</main>
	);
};
