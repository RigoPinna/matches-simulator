import styles from './styles.module.css';

export type TSegment<T extends string> = { value: T; label: string };

interface ISegmentedControl<T extends string> {
	value: T;
	onChange: (value: T) => void;
	options: TSegment<T>[];
	/** Accessible name of the group. */
	label: string;
}

/** iOS-style segmented control (single choice). */
export const SegmentedControl = <T extends string>({
	value,
	onChange,
	options,
	label,
}: ISegmentedControl<T>) => (
	<div className={styles.control} role='radiogroup' aria-label={label}>
		{options.map(option => (
			<button
				key={option.value}
				type='button'
				role='radio'
				aria-checked={value === option.value}
				className={`${styles.segment} ${value === option.value ? styles.active : ''}`}
				onClick={() => onChange(option.value)}>
				{option.label}
			</button>
		))}
	</div>
);
