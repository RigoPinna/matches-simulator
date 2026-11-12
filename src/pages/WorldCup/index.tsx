import { useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SeassonContext } from '../../store';
import { Main } from '../../components/layouts';
import { Button, Header } from '../../components/ui';
import { ArrowLeft } from '../../components/icons';
import { GroupDraw } from './GroupDraw';
import { Groups } from './Groups';
import { KnockoutDraw } from './KnockoutDraw';
import { Knockout } from './Knockout';
import { Summary } from './Summary';
import { STAGE_LABEL } from './constants';
import styles from './styles.module.css';

export const WorldCupPage = () => {
	const navigate = useNavigate();
	const { wid } = useParams();
	const { worldCups } = useContext(SeassonContext);
	const worldCup = worldCups.find(wc => wc.uuid === wid);

	if (!worldCup) {
		return <></>;
	}

	const renderStage = () => {
		switch (worldCup.stage) {
			case 'GROUP_DRAW':
				return <GroupDraw worldCup={worldCup} />;
			case 'GROUPS':
				return <Groups worldCup={worldCup} />;
			case 'KNOCKOUT_DRAW':
				return <KnockoutDraw worldCup={worldCup} />;
			case 'FINISHED':
				return <Summary worldCup={worldCup} />;
			default:
				return <Knockout worldCup={worldCup} />;
		}
	};

	return (
		<>
			<Header>
				<Button.Secondary onClick={() => navigate('/')}>
					<ArrowLeft />
				</Button.Secondary>
				<h1>World Cup {worldCup.number}</h1>
				<span className={styles.header_stage}>{STAGE_LABEL[worldCup.stage]}</span>
			</Header>
			<Main>{renderStage()}</Main>
		</>
	);
};
