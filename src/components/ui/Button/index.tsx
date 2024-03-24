import { MouseEvent, ReactNode } from 'react';
import styles from './styles.module.css';

interface IButton {
	onClick: (event?: MouseEvent<HTMLButtonElement>) => void;
	children: ReactNode;
	className?: string;
}
const Primary = ({ children, onClick, className = '' }: IButton) => {
	return (
		<button className={`${styles.button} ${className}`} onClick={onClick}>
			{children}
		</button>
	);
};
const Button = {
	Primary,
};
export default Button;
