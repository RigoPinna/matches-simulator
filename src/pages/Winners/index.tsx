import { ReactElement, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IClub } from '../../store';
import { Main } from '../../components/layouts';
import { Button, Header, ItemClub, List } from '../../components/ui';
import { ArrowLeft, Champion } from '../../components/icons';

import styles from './styles.module.css';

type Winner = {
	club: IClub;
	champions: number;
};
export const WinnersPage = () => {
	const navigate = useNavigate();
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
									<List.Item className={styles.list_item}>
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
									<List.Item className={styles.list_item}>
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
			</Main>
		</>
	);
};
