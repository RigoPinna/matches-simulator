import { useNavigate, useParams } from 'react-router-dom';
import { Main } from '../../components/layouts';
import { Button, Header, LastMatchesRecord } from '../../components/ui';
import { ArrowLeft } from '../../components/icons';

import styles from './styles.module.css';
import { useContext, useMemo } from 'react';
import { SeassonContext } from '../../store';

export const ClubPage = () => {
	const navigate = useNavigate();
	const { cid } = useParams();
	const { clubs } = useContext(SeassonContext);
	const club = useMemo(() => clubs.find(club => club.uuid === cid), [clubs, cid]);
	if (typeof club === 'undefined') {
		return <></>;
	}
	return (
		<>
			<Header>
				<Button.Secondary
					onClick={() => {
						navigate('/');
					}}>
					<ArrowLeft />
					Back
				</Button.Secondary>
				<h2 className={styles.title_header}>Club</h2>
			</Header>
			<Main>
				<div className={styles.club_info}>
					<img className={styles.club_img} src={club.image} alt={club.name} />
					<h1>{club.name}</h1>
					<LastMatchesRecord />
				</div>
			</Main>
		</>
	);
};
