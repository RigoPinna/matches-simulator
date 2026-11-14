import { IClub } from '../../store';
import {
	MATCH_KIND_LABEL,
	TClubMatch,
	TClubStats,
	TMatchKind,
	TMatchResult,
	TRecord,
	getGoals,
} from '../../helpers';
import { ClubBadge } from '../../components/ui';
import styles from './profile.module.css';

const STREAK_TEXT: Record<TMatchResult, [string, string]> = {
	WIN: ['win', 'wins'],
	DRAW: ['draw', 'draws'],
	LOSS: ['loss', 'losses'],
};

/** Stacked W/D/L bar with counts underneath. */
export const RecordBar = ({ record }: { record: TRecord }) => {
	const pct = (n: number) => (record.played ? (n / record.played) * 100 : 0);
	return (
		<div>
			<div
				className={styles.bar}
				role='img'
				aria-label={`${record.wins} wins, ${record.draws} draws, ${record.losses} losses`}>
				<span className={styles.bar_win} style={{ width: `${pct(record.wins)}%` }} />
				<span className={styles.bar_draw} style={{ width: `${pct(record.draws)}%` }} />
				<span className={styles.bar_loss} style={{ width: `${pct(record.losses)}%` }} />
			</div>
			<div className={styles.bar_legend}>
				<span>
					<i className={styles.dot_win} />
					{record.wins} W
				</span>
				<span>
					<i className={styles.dot_draw} />
					{record.draws} D
				</span>
				<span>
					<i className={styles.dot_loss} />
					{record.losses} L
				</span>
			</div>
		</div>
	);
};

const describeMatch = (m: TClubMatch) => {
	const { own, other } = getGoals(m);
	return (
		<>
			<strong>
				{own}–{other}
			</strong>{' '}
			vs {m.opponent.name}
			<span className={styles.stat_sub}>
				{m.competition} · {m.stage}
			</span>
		</>
	);
};

export const ClubStats = ({ stats }: { stats: TClubStats }) => {
	const gd = stats.goalsFor - stats.goalsAgainst;
	const kinds = (Object.keys(stats.byKind) as TMatchKind[]).filter(k => stats.byKind[k].played > 0);
	return (
		<section className={styles.section}>
			<h3 className={styles.section_title}>Stats</h3>
			<div className={styles.card}>
				<div className={styles.kpis}>
					<div>
						<strong>{stats.played}</strong>
						<span>Played</span>
					</div>
					<div>
						<strong>
							{stats.winPercentage.toFixed(0)}
							<small>%</small>
						</strong>
						<span>Win rate</span>
					</div>
					<div>
						<strong>
							{stats.goalsFor}–{stats.goalsAgainst}
						</strong>
						<span>Goals</span>
					</div>
					<div>
						<strong className={gd > 0 ? styles.positive : gd < 0 ? styles.negative : ''}>
							{gd > 0 ? `+${gd}` : gd}
						</strong>
						<span>Goal diff.</span>
					</div>
				</div>

				<RecordBar record={stats} />

				<dl className={styles.stat_rows}>
					{stats.streak && (
						<div>
							<dt>Current streak</dt>
							<dd>
								<strong>
									{stats.streak.count} {STREAK_TEXT[stats.streak.result][stats.streak.count === 1 ? 0 : 1]}
								</strong>
								{stats.streak.count > 1 ? ' in a row' : ''}
							</dd>
						</div>
					)}
					{stats.biggestWin && (
						<div>
							<dt>Biggest win</dt>
							<dd>{describeMatch(stats.biggestWin)}</dd>
						</div>
					)}
					{stats.biggestLoss && (
						<div>
							<dt>Biggest loss</dt>
							<dd>{describeMatch(stats.biggestLoss)}</dd>
						</div>
					)}
				</dl>

				{kinds.length > 1 && (
					<table className={styles.breakdown}>
						<thead>
							<tr>
								<th scope='col'>Competition</th>
								<th scope='col'>P</th>
								<th scope='col'>W</th>
								<th scope='col'>D</th>
								<th scope='col'>L</th>
							</tr>
						</thead>
						<tbody>
							{kinds.map(kind => (
								<tr key={kind}>
									<th scope='row'>{MATCH_KIND_LABEL[kind]}</th>
									<td>{stats.byKind[kind].played}</td>
									<td>{stats.byKind[kind].wins}</td>
									<td>{stats.byKind[kind].draws}</td>
									<td>{stats.byKind[kind].losses}</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</section>
	);
};

/** Head-to-head summary shown when the match list is filtered by an opponent. */
export const HeadToHead = ({ opponent, stats }: { opponent: IClub; stats: TClubStats }) => (
	<div className={`${styles.card} ${styles.h2h}`}>
		<div className={styles.h2h_head}>
			<span>Head to head</span>
			<span className={styles.h2h_vs}>
				vs <ClubBadge className={styles.h2h_crest} {...opponent} /> {opponent.name}
			</span>
		</div>
		<RecordBar record={stats} />
		<p className={styles.h2h_goals}>
			{stats.played} matches · Goals {stats.goalsFor}–{stats.goalsAgainst}
		</p>
	</div>
);
