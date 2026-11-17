import { ChangeEvent, KeyboardEvent, MouseEvent, useContext, useMemo, useState } from 'react';
import { SeassonContext, TMatches } from '../../../store';
import { TAddMyScore } from '../../../store/Seasson/seassonReducer';
import { useCurrentSeasonParams, useModal } from '../../../hooks';
import { Button, Input, ItemClub, Modal } from '..';
import { Star, Ok, Fire } from '../../icons';
import { getRandomResult } from '../../../helpers/getRandomScore';

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
	const [form, setForm] = useState<{ local: number | null; visitor: number | null }>({
		local: null,
		visitor: null,
	});
	const isMyClub = useMemo(
		() => myClub?.uuid === local.uuid || myClub?.uuid === visit.uuid,
		[myClub],
	);
	const played = status === 'DONE' && typeof local.score === 'number' && typeof visit.score === 'number';
	const pendingMine = isMyClub && status === 'TODO';
	const winner: 'local' | 'visit' | null = !played
		? null
		: (local.score as number) > (visit.score as number)
			? 'local'
			: (local.score as number) < (visit.score as number)
				? 'visit'
				: null;
	const onKeyDown = (evt: KeyboardEvent<HTMLLIElement>) => {
		if (evt.key === 'Enter' || evt.key === ' ') {
			evt.preventDefault();
			onOpen();
		}
	};

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

	/** Fills both inputs with a random result (no draws in semifinal / final). */
	const simulateScore = (evt?: MouseEvent<HTMLButtonElement>) => {
		evt?.preventDefault();
		const result = getRandomResult(type !== 'REGULAR');
		setForm({ local: result.local, visitor: result.visit });
	};

	const handleAddScore = ({ target }: ChangeEvent<HTMLInputElement>) => {
		setForm({
			...form,
			[target.name]: +target.value,
		});
	};
	return (
		<>
			<li
				className={`${styles.match} ${pendingMine ? styles.match_mine : ''} ${isMyClub ? styles.match_own : ''}`}
				onClick={pendingMine ? onOpen : undefined}
				onKeyDown={pendingMine ? onKeyDown : undefined}
				role={pendingMine ? 'button' : undefined}
				tabIndex={pendingMine ? 0 : undefined}
				aria-label={pendingMine ? `Enter your score: ${local.name} vs ${visit.name}` : undefined}>
				<ItemClub
					className={`${styles.club} ${styles.club_local} ${winner === 'visit' ? styles.loser : ''} ${winner === 'local' ? styles.winner : ''}`}
					uuid={local.uuid}
					image={local.image}
					name={local.name}
					color={local.color}
				/>
				<span className={`${styles.score} ${played ? styles.score_played : ''}`}>
					{played ? (
						<>
							<span>{local.score}</span>
							<span className={styles.score_sep}>–</span>
							<span>{visit.score}</span>
						</>
					) : (
						'vs'
					)}
				</span>
				<ItemClub
					className={`${styles.club} ${styles.club_visit} ${winner === 'local' ? styles.loser : ''} ${winner === 'visit' ? styles.winner : ''}`}
					uuid={visit.uuid}
					image={visit.image}
					name={visit.name}
					color={visit.color}
				/>
				{pendingMine && (
					<span className={styles.mine_star} aria-hidden='true'>
						<Star />
					</span>
				)}
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
						<div className={styles.modal_actions}>
							<Button.Secondary onClick={simulateScore} className={styles.modal_simulate}>
								<Fire />
								Simulate
							</Button.Secondary>
							<Button.Primary onClick={setScore} className={styles.modal_btn}>
								<Ok />
							</Button.Primary>
						</div>
					)}
				</form>
			</Modal>
		</>
	);
};
