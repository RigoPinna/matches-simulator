import { useNavigate } from 'react-router-dom';
import { Button, Header } from '../../components/ui';
import { ArrowLeft } from '../../components/icons';
import { Main } from '../../components/layouts';
import { useEffect, useState } from 'react';
import { IClub } from '../../store';
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

	return (
		<>
			<Header>
				<Button.Secondary onClick={() => navigate(-1)}>
					<ArrowLeft />
				</Button.Secondary>
				<h1>Winners</h1>
			</Header>
			<Main>
				<ol>
					{winners
						.sort((a, b) => b.champions - a.champions)
						.map(item => (
							<li>
								<span>{item.club.name}: </span>
								<strong>{`🏆x${item.champions}`}</strong>
							</li>
						))}
				</ol>
			</Main>
		</>
	);
};
