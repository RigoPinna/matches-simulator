import { IClub } from '../../store';
import { MATCH_KIND_LABEL, TClubMatchFilters, TMatchKind, TMatchResult } from '../../helpers';
import { ClubBadge, SegmentedControl } from '../../components/ui';
import styles from './matches.module.css';

const RESULT_OPTIONS: { value: TMatchResult | 'ALL'; label: string }[] = [
	{ value: 'ALL', label: 'All' },
	{ value: 'WIN', label: 'Won' },
	{ value: 'DRAW', label: 'Drawn' },
	{ value: 'LOSS', label: 'Lost' },
];
const KIND_OPTIONS: { value: TMatchKind | 'ALL'; label: string }[] = [
	{ value: 'ALL', label: 'All' },
	{ value: 'LEAGUE', label: MATCH_KIND_LABEL.LEAGUE },
	{ value: 'SUPERCUP', label: MATCH_KIND_LABEL.SUPERCUP },
	{ value: 'WORLD_CUP', label: MATCH_KIND_LABEL.WORLD_CUP },
];

interface IMatchFilters {
	filters: TClubMatchFilters;
	onChange: (filters: TClubMatchFilters) => void;
	opponents: { club: IClub; count: number }[];
}

/** Content of the "Filters" sheet. Changes apply right away. */
export const MatchFilters = ({ filters, onChange, opponents }: IMatchFilters) => {
	const set = (patch: Partial<TClubMatchFilters>) => onChange({ ...filters, ...patch });

	return (
		<>
			<section className={styles.filter_section}>
				<h3 className={styles.filter_title}>Result</h3>
				<SegmentedControl
					label='Result'
					value={filters.result}
					options={RESULT_OPTIONS}
					onChange={result => set({ result })}
				/>
			</section>

			<section className={styles.filter_section}>
				<h3 className={styles.filter_title}>Match type</h3>
				<SegmentedControl
					label='Match type'
					value={filters.kind}
					options={KIND_OPTIONS}
					onChange={kind => set({ kind })}
				/>
				<p className={styles.filter_hint}>
					League: regular season · Supercup: semifinals and finals · World Cup: group stage and
					knockouts
				</p>
			</section>

			<section className={styles.filter_section}>
				<h3 className={styles.filter_title}>Team</h3>
				<div className={styles.chips} role='radiogroup' aria-label='Team'>
					<button
						type='button'
						role='radio'
						aria-checked={filters.opponent === 'ALL'}
						className={`${styles.chip} ${filters.opponent === 'ALL' ? styles.chip_active : ''}`}
						onClick={() => set({ opponent: 'ALL' })}>
						All teams
					</button>
					{opponents.map(({ club, count }) => (
						<button
							key={club.uuid}
							type='button'
							role='radio'
							aria-checked={filters.opponent === club.uuid}
							className={`${styles.chip} ${filters.opponent === club.uuid ? styles.chip_active : ''}`}
							onClick={() => set({ opponent: club.uuid })}>
							<ClubBadge className={styles.chip_crest} {...club} />
							{club.name}
							<span className={styles.chip_count}>{count}</span>
						</button>
					))}
				</div>
			</section>
		</>
	);
};
