import { CSSProperties, PointerEvent, ReactNode, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './styles.module.css';

const CLOSE_MS = 260;
/** Drag distance (px) past which releasing closes the sheet. */
const DISMISS_DISTANCE = 110;
/** Downward speed (px/ms) past which a flick closes the sheet. */
const DISMISS_VELOCITY = 0.6;

interface IBottomSheet {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
	/** Sticky area at the bottom (e.g. action buttons). */
	footer?: ReactNode;
}

/**
 * iOS-style modal sheet: slides up from the bottom, can be dismissed by
 * dragging the grabber / header down, tapping the backdrop or pressing Esc.
 */
export const BottomSheet = ({ isOpen, onClose, title, children, footer }: IBottomSheet) => {
	const titleId = useId();
	// Stay mounted while the close animation plays.
	const [mounted, setMounted] = useState(isOpen);
	const [closing, setClosing] = useState(false);
	const [dragY, setDragY] = useState(0);
	const drag = useRef<{ startY: number; startTime: number } | null>(null);

	useEffect(() => {
		if (isOpen) {
			setMounted(true);
			setClosing(false);
			setDragY(0);
			return;
		}
		if (!mounted) return;
		setClosing(true);
		const id = setTimeout(() => {
			setMounted(false);
			setClosing(false);
			setDragY(0);
		}, CLOSE_MS);
		return () => clearTimeout(id);
	}, [isOpen]);

	useEffect(() => {
		if (!mounted) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		const onKey = (evt: KeyboardEvent) => evt.key === 'Escape' && onClose();
		window.addEventListener('keydown', onKey);
		return () => {
			document.body.style.overflow = previous;
			window.removeEventListener('keydown', onKey);
		};
	}, [mounted, onClose]);

	if (!mounted) return null;

	const onPointerDown = (evt: PointerEvent<HTMLDivElement>) => {
		drag.current = { startY: evt.clientY, startTime: performance.now() };
		evt.currentTarget.setPointerCapture(evt.pointerId);
	};
	const onPointerMove = (evt: PointerEvent<HTMLDivElement>) => {
		if (!drag.current) return;
		setDragY(Math.max(0, evt.clientY - drag.current.startY));
	};
	const onPointerUp = (evt: PointerEvent<HTMLDivElement>) => {
		if (!drag.current) return;
		const distance = Math.max(0, evt.clientY - drag.current.startY);
		const velocity = distance / Math.max(1, performance.now() - drag.current.startTime);
		drag.current = null;
		if (distance > DISMISS_DISTANCE || velocity > DISMISS_VELOCITY) onClose();
		else setDragY(0);
	};

	const dragging = drag.current !== null;

	return createPortal(
		<div className={`${styles.root} ${closing ? styles.closing : ''}`}>
			<div className={styles.backdrop} onClick={onClose} />
			<div
				className={styles.sheet}
				role='dialog'
				aria-modal='true'
				aria-labelledby={titleId}
				style={
					{
						'--drag': `${dragY}px`,
						transform: dragY ? `translateY(${dragY}px)` : undefined,
						transition: dragging ? 'none' : undefined,
					} as CSSProperties
				}>
				<div
					className={styles.drag_area}
					onPointerDown={onPointerDown}
					onPointerMove={onPointerMove}
					onPointerUp={onPointerUp}
					onPointerCancel={onPointerUp}>
					<span className={styles.grabber} />
					<h2 id={titleId} className={styles.title}>
						{title}
					</h2>
				</div>
				<div className={styles.body}>{children}</div>
				{footer && <div className={styles.footer}>{footer}</div>}
			</div>
		</div>,
		document.querySelector('#modal')!,
	);
};
