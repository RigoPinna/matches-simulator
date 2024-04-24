import { MouseEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './styles.module.css';
import { Exit } from '../../icons';

type TModal = {
	title?: string;
	isOpen: boolean;
	onClose: () => void;
	children: ReactNode;
};
export const Modal = ({ children, title, isOpen, onClose }: TModal) => {
	const stopPropagation = (evt: MouseEvent<HTMLElement>) => {
		evt.stopPropagation();
	};
	return (
		<>
			{isOpen &&
				createPortal(
					<div className={styles.background} onClick={onClose}>
						<div className={styles.modal_container} onClick={stopPropagation}>
							<div className={styles.header}>
								{title && <h5>{title}</h5>}
								<button onClick={onClose}>
									<Exit />
								</button>
							</div>
							<div className={styles.body}>{children}</div>
						</div>
					</div>,
					document.querySelector('#modal')!,
				)}
		</>
	);
};
