import { ReactElement, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IClub } from '../../store';
import { Main } from '../../components/layouts';
import { Button, Header, Input, ItemClub, List, Modal } from '../../components/ui';
import { ArrowLeft, Champion } from '../../components/icons';

import styles from './styles.module.css';
import { useModal } from '../../hooks';

type Winner = {
	club: IClub;
	champions: number;
};
type IClubSelected = {
	type: 'regular' | 'super';
	club: IClub;
};
export const WinnersPage = () => {
	const navigate = useNavigate();
	const { isOpen, onOpen, onClose } = useModal();

	const [clubSelected, setClubSelected] = useState<IClubSelected>();
	const [values, setValues] = useState({
		champions: clubSelected?.club.champions || 0,
		supercups: clubSelected?.club.supercups || 0,
	});
	const [winnersLeague, setWinnersLeague] = useState<Winner[]>([]);
	const [winnersSupercup, setWinnersSupercup] = useState<Winner[]>([]);

	useEffect(() => {
		const clubs = JSON.parse(localStorage.getItem('clubs') || '[]') as IClub[];

		if (clubs.length > 0) {
			setWinnersLeague(clubs.map(item => ({ club: item, champions: item.champions || 0 })));
			setWinnersSupercup(clubs.map(item => ({ club: item, champions: item.supercups || 0 })));
		}
	}, []);
	const setThropies = (numberOfThropy: number, type: 'league' | 'supercup') => {
		const thropies: ReactElement[] = [];

		for (let index = 0; index < numberOfThropy; index++) {
			thropies.push(<Champion className={styles.thropy} type={type} />);
		}

		return thropies.map(Thropy => <>{Thropy}</>);
	};
	const onOpenModal = (winner: IClub, type: IClubSelected['type']) => {
		onOpen();
		setClubSelected({ club: winner, type });
	};
	const onUpdateClub = () => {
		const clubs = JSON.parse(localStorage.getItem('clubs') || '[]') as IClub[];
		if (clubSelected) {
			localStorage.setItem(
				'clubs',
				JSON.stringify(
					clubs.map(item =>
						item.uuid === clubSelected.club.uuid
							? {
									...item,
									champions: values.champions,
									supercups: values.supercups || item.supercups,
								}
							: item,
					),
				),
			);
		}
	};
	return (
		<>
			<Header>
				<Button.Secondary onClick={() => navigate(-1)}>
					<ArrowLeft />
				</Button.Secondary>
				<h1>Winners</h1>
			</Header>
			<Main>
				<List.Container className={styles.list} title='League:'>
					{winnersLeague
						.sort((a, b) => b.champions - a.champions)
						.map(item => (
							<>
								{item.champions > 0 && (
									<List.Item
										key={`winnercham${item.club.uuid}`}
										className={styles.list_item}
										onClick={() => {
											onOpenModal(item.club, 'regular');
										}}>
										<div className={styles.list_body}>
											<span>
												<ItemClub {...item.club} />
												<span>{item.champions}</span>
											</span>
											<div className={styles.shelf}>{setThropies(item.champions, 'league')}</div>
										</div>
									</List.Item>
								)}
							</>
						))}
				</List.Container>
				<br />
				<List.Container className={styles.list} title='Supercup:'>
					{winnersSupercup
						.sort((a, b) => b.champions - a.champions)
						.map(item => (
							<>
								{item.champions > 0 && (
									<List.Item
										key={`winnersup${item.club.uuid}`}
										className={styles.list_item}
										onClick={() => {
											onOpenModal(item.club, 'super');
										}}>
										<div className={styles.list_body}>
											<span>
												<ItemClub {...item.club} />
												<span>{item.champions}</span>
											</span>
											<div className={styles.shelf}>{setThropies(item.champions, 'supercup')}</div>
										</div>
									</List.Item>
								)}
							</>
						))}
				</List.Container>
				<Modal isOpen={isOpen} onClose={onClose} title={`Update ${clubSelected?.club.name}`}>
					<span>Champions:</span>
					<Input
						name='champions'
						type='number'
						onChange={({ target }) =>
							setValues({
								...values,
								[target.name]: target.value,
							})
						}
						value={values.champions || ''}
					/>
					<span>Supercups</span>
					<Input
						name='supercups'
						type='number'
						onChange={({ target }) =>
							setValues({
								...values,
								[target.name]: target.value,
							})
						}
						value={values.supercups || ''}
					/>
					<Button.Primary className={styles.btn} onClick={onUpdateClub}>
						Save
					</Button.Primary>
				</Modal>
			</Main>
		</>
	);
};
