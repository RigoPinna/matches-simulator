import { Link } from 'react-router-dom';
import { LEAGUE_INFO, TLeague } from '../../store';
import { TSeasonRow, getSeasonLabel, ordinal } from '../../helpers';
import leagueTrophy from '../../assets/champion.png';
import supercupTrophy from '../../assets/supercup.png';
import styles from './profile.module.css';

const LEAGUE_COLOR: Record<TLeague, string> = {
	PRIMERA: '#0a84ff',
	PLATE: '#8e8e93',
	ESP_ENG: '#64b0ff',
	BRA_ARG: '#64b0ff',
	GER_USA: '#64b0ff',
};

const CHART_W = 320;
const CHART_H = 110;
const PAD = { top: 12, right: 12, bottom: 22, left: 30 };

/** Final position per season (oldest → newest); 1st at the top. */
const PositionChart = ({ rows }: { rows: TSeasonRow[] }) => {
	const chrono = [...rows].reverse();
	const maxTeams = Math.max(...chrono.map(r => r.teams));
	const innerW = CHART_W - PAD.left - PAD.right;
	const innerH = CHART_H - PAD.top - PAD.bottom;
	const x = (i: number) => PAD.left + (chrono.length === 1 ? innerW / 2 : (i / (chrono.length - 1)) * innerW);
	const y = (pos: number) => PAD.top + ((pos - 1) / Math.max(1, maxTeams - 1)) * innerH;
	const labelEvery = Math.ceil(chrono.length / 8);
	const best = Math.min(...chrono.map(r => r.position));

	return (
		<svg
			className={styles.chart}
			viewBox={`0 0 ${CHART_W} ${CHART_H}`}
			role='img'
			aria-label={`Final position per season, best ${ordinal(best)}`}>
			{[1, maxTeams].map(pos => (
				<g key={pos}>
					<line
						x1={PAD.left}
						x2={CHART_W - PAD.right}
						y1={y(pos)}
						y2={y(pos)}
						className={styles.chart_grid}
					/>
					<text x={PAD.left - 6} y={y(pos) + 3} className={styles.chart_axis} textAnchor='end'>
						{ordinal(pos)}
					</text>
				</g>
			))}
			<polyline
				className={styles.chart_line}
				points={chrono.map((r, i) => `${x(i)},${y(r.position)}`).join(' ')}
			/>
			{chrono.map((r, i) => (
				<g key={r.uuid}>
					<circle
						cx={x(i)}
						cy={y(r.position)}
						r={r.wonLeague ? 5 : 3.5}
						fill={LEAGUE_COLOR[r.league]}
						className={r.wonLeague ? styles.chart_title : undefined}
					/>
					{i % labelEvery === 0 && (
						<text x={x(i)} y={CHART_H - 6} className={styles.chart_axis} textAnchor='middle'>
							{r.number}
						</text>
					)}
				</g>
			))}
		</svg>
	);
};

export const SeasonHistory = ({ rows }: { rows: TSeasonRow[] }) => {
	if (rows.length === 0) return null;
	return (
		<section className={styles.section}>
			<h3 className={styles.section_title}>Seasons</h3>
			{rows.length > 1 && (
				<div className={`${styles.card} ${styles.chart_card}`}>
					<PositionChart rows={rows} />
					<div className={styles.chart_legend}>
						{[...new Set(rows.map(r => r.league))].map(league => (
							<span key={league}>
								<i style={{ background: LEAGUE_COLOR[league] }} />
								{LEAGUE_INFO[league].short}
							</span>
						))}
						<span>
							<i className={styles.legend_title} />
							League title
						</span>
					</div>
				</div>
			)}
			<ul className={styles.list_card}>
				{rows.map(row => (
					<li key={row.uuid}>
						<Link to={`/seasson/${row.uuid}`} className={styles.season_row}>
							<div className={styles.season_main}>
								<span className={styles.season_name}>
									{getSeasonLabel(row)}
									{row.isCurrent && <span className={styles.live}>Live</span>}
								</span>
								<span className={styles.season_league}>{LEAGUE_INFO[row.league].name}</span>
							</div>
							<div className={styles.season_badges}>
								{row.wonLeague && <img src={leagueTrophy} alt='League title' title='League title' />}
								{row.wonSupercup && <img src={supercupTrophy} alt='Supercup' title='Supercup' />}
								{row.movement === 'PROMOTED' && <span className={styles.up}>↑ Promoted</span>}
								{row.movement === 'RELEGATED' && <span className={styles.down}>↓ Relegated</span>}
							</div>
							<div className={styles.season_pos}>
								<strong>{ordinal(row.position)}</strong>
								<span>{row.pts} pts</span>
							</div>
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
};
