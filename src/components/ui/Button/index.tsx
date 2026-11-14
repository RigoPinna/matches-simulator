import { MouseEvent, ReactNode } from 'react';
import styles from './styles.module.css';

interface IButton {
	onClick: (event?: MouseEvent<HTMLButtonElement>) => void;
	children: ReactNode;
	className?: string;
	disabled?: boolean;
	/** Tooltip, e.g. why the button is disabled. */
	title?: string;
}
const Primary = ({ children, onClick, className = '', disabled = false, title }: IButton) => {
	return (
		<button
			className={`${styles.button} ${className}`}
			onClick={onClick}
			disabled={disabled}
			title={title}>
			{children}
		</button>
	);
};

const Secondary = ({ children, onClick, className, disabled = false, title }: IButton) => {
	return (
		<button
			className={`${styles.button} ${styles.secondary} ${className}`}
			onClick={evt => onClick(evt)}
			disabled={disabled}
			title={title}>
			{children}
		</button>
	);
};
const Button = {
	Primary,
	Secondary,
};
export default Button;
