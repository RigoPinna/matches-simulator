import { ChangeEvent, MouseEvent, useContext, useState } from 'react';
import { SeassonContext, TMatches } from '../../store';
import { TWorldCupAddMyScore } from '../../store/WorldCup/worldCupReducer';
import { getWinner, isMyClub } from '../../helpers';
import { useModal } from '../../hooks';
import { Button, Input, ItemClub, Modal } from '../../components/ui';
import { Ok, Star } from '../../components/icons';
import styles from './styles.module.css';

interface IWorldCupMatch {
	wid: string;
	match: TMatches;
	/** Knockout: draws are not allowed. */
	knockout: boolean;
}

const toScore = (value: string) => {
	const n = parseInt(value, 10);
	return Number.isNaN(n) || n < 0 ? 0 : Math.min(n, 99);
};

export const WorldCupMatch = ({ wid, match, knockout }: IWorldCupMatch) => {
	const { myClub, dispatch } = useContext(SeassonContext);
	const { isOpen, onOpen, onClose } = useModal(false);
	const [form, setForm] = useState({ local: 0, visit: 0 });

	const { local, visit, status } = match;
	const mine = !!myClub && isMyClub(match, myClub);
	const editable = mine && status === 'TODO';
	const done = status === 'DONE';
	const result = done ? getWinner(match) : undefined;
	const loserUuid = knockout && result && result.type !== 'DRAW' ? result.loser.uuid : undefined;

	const invalid = knockout && form.local === form.visit;

	const onChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
		setForm(prev => ({ ...prev, [target.name]: toScore(target.value) }));
	};
	const onSave = (evt?: MouseEvent<HTMLButtonElement>) => {
		evt?.preventDefault();
		if (invalid) return;
		dispatch({
			type: '[WORLDCUP] - ADD MY SCORE',
			payload: {
				wid,
				matchUuid: match.uuid,
				local: form.local,
				visit: form.visit,
			} as TWorldCupAddMyScore,
		});
		onClose();
	};

	return (
		<>
			<li
				className={`${styles.match} ${editable ? styles.match_clickable : ''}`}
				onClick={editable ? onOpen : undefined}>
				{editable && (
					<span className={styles.match_player}>
						<Star />
					</span>
				)}
				<ItemClub
					className={`${styles.match_club} ${loserUuid === local.uuid ? styles.match_loser : ''}`}
					image={local.image}
					name={local.name}
					color={local.color}
				/>
				<div className={styles.match_score}>
					{done ? `${local.score} - ${visit.score}` : 'vs'}
				</div>
				<ItemClub
					className={`${styles.match_club} ${styles.match_club_visit} ${loserUuid === visit.uuid ? styles.match_loser : ''}`}
					image={visit.image}
					name={visit.name}
					color={visit.color}
				/>
			</li>
			<Modal title='Add your score' isOpen={isOpen} onClose={onClose}>
				<form>
					<div className={styles.modal_row}>
						<ItemClub {...local} />
						<Input
							className={styles.modal_input}
							name='local'
							type='number'
							value={form.local}
							onChange={onChange}
						/>
					</div>
					<div className={styles.modal_row}>
						<ItemClub {...visit} />
						<Input
							className={styles.modal_input}
							name='visit'
							type='number'
							value={form.visit}
							onChange={onChange}
						/>
					</div>
					{invalid && (
						<p className={styles.modal_error}>Knockout matches need a winner — no draws</p>
					)}
					<Button.Primary
						onClick={onSave}
						className={`${styles.modal_btn} ${invalid ? styles.modal_btn_disabled : ''}`}>
						<Ok />
						Save
					</Button.Primary>
				</form>
			</Modal>
		</>
	);
};
