import { ChangeEvent, MouseEvent, useContext, useMemo, useState } from 'react';
import { SeassonContext, TMatches } from '../../../store';
import { TAddMyScore } from '../../../store/Seasson/seassonReducer';
import { useCurrentSeasonParams, useModal } from '../../../hooks';
import { Button, Input, ItemClub, Modal } from '..';
import { Star, Ok } from '../../icons';

import styles from './styles.module.css';

type TItemMatch = {
	type: 'REGULAR' | 'SEMI' | 'FINAL';
	jid: string;
} & TMatches;

const MATCH_TYPE = {
	REGULAR: 'regular',
	SEMI: 'semifinal',
	FINAL: 'final',
};
Object.freeze(MATCH_TYPE);
export const ItemMatch = ({ type, local, visit, status, jid, uuid }: TItemMatch) => {
	const { myClub, dispatch } = useContext(SeassonContext);
	const { isOpen, onClose, onOpen } = useModal(false);
	const { season } = useCurrentSeasonParams();
	const [form, setForm] = useState({ local: null, visitor: null });
	const isMyClub = useMemo(
		() => myClub?.uuid === local.uuid || myClub?.uuid === visit.uuid,
		[myClub],
	);

	const setScore = (evt?: MouseEvent<HTMLButtonElement>) => {
		evt?.preventDefault();
		dispatch({
			type: '[SEASSON] - ADDED MY SCORE',
			payload: {
				jid,
				match: {
					uuid,
					status: 'TODO',
					local: {
						...local,
						score: form.local || 0,
					},
					visit: {
						...visit,
						score: form.visitor || 0,
					},
				},
				sid: season?.uuid,
				type: MATCH_TYPE[type],
			} as TAddMyScore,
		});
		onClose();
	};

	const handleAddScore = ({ target }: ChangeEvent<HTMLInputElement>) => {
		setForm({
			...form,
			[target.name]: +target.value,
		});
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
			<Modal title='Add your score' isOpen={isOpen} onClose={onClose}>
				<form>
					<div className={styles.wrapper_input_modal}>
						<ItemClub className={styles.club_modal} {...local} />
						<Input
							name='local'
							type='text'
							value={form.local || 0}
							onChange={handleAddScore}
							placeholder='0'
						/>
					</div>
					<div className={styles.wrapper_input_modal}>
						<ItemClub className={styles.club_modal} {...visit} />
						<Input
							name='visitor'
							type='text'
							value={form.visitor || 0}
							onChange={handleAddScore}
							placeholder='0'
						/>
					</div>
					{status === 'TODO' && (
						<Button.Primary onClick={setScore} className={styles.modal_btn}>
							<Ok />
						</Button.Primary>
					)}
				</form>
			</Modal>
		</>
	);
};
