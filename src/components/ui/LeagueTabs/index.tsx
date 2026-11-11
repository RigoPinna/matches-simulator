import { TLeague } from '../../../store';
import styles from './styles.module.css';

export type TTabOption<T extends string> = { value: T; label: string };

const DEFAULT_OPTIONS: TTabOption<TLeague>[] = [
	{ value: 'PRIMERA', label: 'Premier Leagues' },
	{ value: 'PLATE', label: 'Plate Ligue' },
];

interface ILeagueTabs<T extends string> {
	value: T;
	onChange: (value: T) => void;
	/** Defaults to Primera / Plate Ligue. */
	options?: TTabOption<T>[];
	className?: string;
}
export const LeagueTabs = <T extends string = TLeague>({
	value,
	onChange,
	options = DEFAULT_OPTIONS as unknown as TTabOption<T>[],
	className = '',
}: ILeagueTabs<T>) => {
	return (
		<div className={`${styles.tabs} ${options.length > 2 ? styles.scrollable : ''} ${className}`}>
			{options.map(option => (
				<button
					key={option.value}
					className={`${styles.tab} ${value === option.value ? styles.active : ''}`}
					onClick={() => onChange(option.value)}>
					{option.label}
				</button>
			))}
		</div>
	);
};
