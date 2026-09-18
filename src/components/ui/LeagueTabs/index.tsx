import { TLeague } from '../../../store';
import styles from './styles.module.css';

interface ILeagueTabs {
	value: TLeague;
	onChange: (league: TLeague) => void;
	className?: string;
}
export const LeagueTabs = ({ value, onChange, className = '' }: ILeagueTabs) => {
	return (
		<div className={`${styles.tabs} ${className}`}>
			<button
				className={`${styles.tab} ${value === 'PRIMERA' ? styles.active : ''}`}
				onClick={() => onChange('PRIMERA')}>
				Premier Leagues
			</button>
			<button
				className={`${styles.tab} ${value === 'PLATE' ? styles.active : ''}`}
				onClick={() => onChange('PLATE')}>
				Plate Ligue
			</button>
		</div>
	);
};
