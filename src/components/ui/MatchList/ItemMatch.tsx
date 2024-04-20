import { MouseEvent, useContext, useMemo } from 'react';
import { SeassonContext, TMatches } from '../../../store';
import { useModal } from '../../../hooks';
import { Button, Input, ItemClub, Modal } from '..';
import { Star, Ok } from '../../icons';

import styles from './styles.module.css';

type TItemMatch = {
	type: 'REGULAR' | 'SEMI' | 'FINAL';
} & TMatches;
export const ItemMatch = ({ type, local, visit, status }: TItemMatch) => {
	const { myClub } = useContext(SeassonContext);
	const { isOpen, onClose, onOpen } = useModal(false);

	const isMyClub = useMemo(
		() => myClub?.uuid === local.uuid || myClub?.uuid === visit.uuid,
		[myClub],
	);

	const setScore = (evt?: MouseEvent<HTMLButtonElement>) => {
		evt?.preventDefault();
	};
	return (
		<>
			<li className={styles.match} onClick={isMyClub && status === 'TODO' ? onOpen : undefined}>
				{isMyClub && (
					<span className={styles.match_player}>
						<Star />
					</span>
				)}
				<ItemClub className={styles.club} image={local.image} name={local.name} />
				<p className={styles.match_score}>
					{local.score} - {visit.score}
				</p>
				<ItemClub className={styles.club} image={visit.image} name={visit.name} />
			</li>
			<Modal title='title' isOpen={isOpen} onClose={onClose}>
				<form>
					<div className={styles.wrapper_input_modal}>
						<ItemClub className={styles.club_modal} {...local} />
						<Input name='local' type='text' value={''} onChange={() => {}} placeholder='0' />
					</div>
					<div className={styles.wrapper_input_modal}>
						<ItemClub className={styles.club_modal} {...visit} />
						<Input name='visitor' type='text' value={''} onChange={() => {}} placeholder='0' />
					</div>
					<Button.Primary onClick={setScore} className={styles.modal_btn}>
						<Ok />
					</Button.Primary>
				</form>
			</Modal>
		</>
	);
};
