import { ReactElement, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IClub } from '../../store';
import { Main } from '../../components/layouts';
import { Button, Header, List } from '../../components/ui';
import { ArrowLeft, Champion } from '../../components/icons';

import styles from './styles.module.css';

type Winner = {
	club: IClub;
	champions: number;
};
export const WinnersPage = () => {
	const navigate = useNavigate();
	const [winners, setwinners] = useState<Winner[]>([]);

	useEffect(() => {
		const clubs = JSON.parse(localStorage.getItem('clubs') || '[]') as IClub[];

		if (clubs.length > 0) {
			setwinners(clubs.map(item => ({ club: item, champions: item.champions || 0 })));
		}
	}, []);
	const setThropies = (numberOfThropy: number) => {
		const thropies: ReactElement[] = [];

		for (let index = 0; index < numberOfThropy; index++) {
			thropies.push(<Champion className={styles.thropy} />);
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
				<List.Container className={styles.list} title='All winners'>
					{winners
						.sort((a, b) => b.champions - a.champions)
						.map(item => (
							<>
								{item.champions > 0 && (
									<List.Item className={styles.list_item}>
										<div className={styles.list_body}>
											<span>
												{item.club.name}
												<span>{item.champions}</span>
											</span>
											<div className={styles.shelf}>{setThropies(item.champions)}</div>
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
