import { CSSProperties, RefObject, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { IItemTable, SeassonContext, TSeason } from '../../store';
import { TFormResult, getPositionChanges, getSeasonForm } from '../../helpers';
import { ClubBadge, Table } from '../../components/ui';
import styles from './standings.module.css';

export type TTableView = 'season' | 'total' | 'worldCup';
type TZone = 'supercup' | 'promotion' | 'relegation' | 'qualify';

const ROW = 38;
/** Scroll distance in one direction before switching between strip and full table. */
const SCROLL_THRESHOLD = 12;

const ZONE_LABEL: Record<TZone, string> = {
	supercup: 'Supercup',
	promotion: 'Promotion',
	relegation: 'Relegation',
	qualify: 'World Cup',
};
const FORM_CLASS: Record<TFormResult, string> = {
	WIN: styles.form_win,
	DRAW: styles.form_draw,
	LOSS: styles.form_loss,
};

/** Highlighted positions for each view (index → zone). */
const getZones = (view: TTableView, season: TSeason, rows: number): Map<number, TZone> => {
	const zones = new Map<number, TZone>();
	if (view === 'season') [0, 1, 2, 3].forEach(i => zones.set(i, 'supercup'));
	if (view === 'worldCup') [0, 1, 2, 3].forEach(i => zones.set(i, 'qualify'));
	if (view === 'total' && season.league === 'PRIMERA') zones.set(rows - 1, 'relegation');
	if (view === 'total' && season.league === 'PLATE') zones.set(0, 'promotion');
	return zones;
};

type TBoardProps = {
	rows: IItemTable[];
	zones: Map<number, TZone>;
	changes?: Map<string, number>;
	form?: Map<string, TFormResult[]>;
	myClubUuid?: string;
};

/** Compact standings. Rows keep a stable DOM order and slide to their position. */
const Board = ({ rows, zones, changes, form, myClubUuid }: TBoardProps) => {
	const stable = useMemo(() => [...rows].sort((a, b) => a.club.uuid.localeCompare(b.club.uuid)), [rows]);
	const positions = new Map(rows.map((row, i) => [row.club.uuid, i]));
	return (
		<div>
			<div className={styles.board_head} aria-hidden='true'>
				<span className={styles.col_pos}>#</span>
				<span className={styles.col_club}>Club</span>
				<span className={styles.col_num}>Pts</span>
				<span className={styles.col_num}>GD</span>
				{form && <span className={styles.col_form}>Form</span>}
			</div>
			<ol className={styles.board} style={{ height: rows.length * ROW }}>
				{stable.map(row => {
					const position = positions.get(row.club.uuid)!;
					const zone = zones.get(position);
					const change = changes?.get(row.club.uuid) ?? 0;
					const results = form?.get(row.club.uuid) ?? [];
					const mine = row.club.uuid === myClubUuid;
					return (
						<li
							key={row.club.uuid}
							className={`${styles.row} ${mine ? styles.row_mine : ''}`}
							style={{ transform: `translateY(${position * ROW}px)` }}
							aria-label={`${position + 1}. ${row.club.name}, ${row.pts} points`}>
							<span className={`${styles.zone} ${zone ? styles[`zone_${zone}`] : ''}`} />
							<span className={styles.col_pos}>
								{position + 1}
								{changes && (
									<span
										className={`${styles.change} ${change > 0 ? styles.up : change < 0 ? styles.down : ''}`}
										aria-label={change ? `${change > 0 ? 'up' : 'down'} ${Math.abs(change)}` : 'no change'}>
										{change > 0 ? `▲${change}` : change < 0 ? `▼${-change}` : '–'}
									</span>
								)}
							</span>
							<span className={styles.col_club}>
								<ClubBadge className={styles.crest} {...row.club} />
								<span className={styles.name}>{row.club.name}</span>
							</span>
							<span className={`${styles.col_num} ${styles.pts}`}>{row.pts}</span>
							<span className={styles.col_num}>{row.gd > 0 ? `+${row.gd}` : row.gd}</span>
							{form && (
								<span className={styles.col_form}>
									{Array.from({ length: 5 }, (_, i) => {
										const result = results[i - (5 - results.length)];
										return <i key={i} className={`${styles.dot} ${result ? FORM_CLASS[result] : ''}`} />;
									})}
								</span>
							)}
						</li>
					);
				})}
			</ol>
		</div>
	);
};

type TMode = 'inline' | 'strip' | 'overlay';

/**
 * Inline table at the top of the page. Once it scrolls out of view, scrolling
 * down shows a compact sticky strip and scrolling up drops the full table
 * over the content. Both float (position: fixed), so the page never jumps.
 */
const useCollapsingTable = (inlineRef: RefObject<HTMLElement>) => {
	const [mode, setMode] = useState<TMode>('inline');
	const [top, setTop] = useState(60);
	useEffect(() => {
		let lastY = window.scrollY;
		let travel = 0;
		const onScroll = () => {
			const y = window.scrollY;
			const delta = y - lastY;
			lastY = y;
			const headerHeight = document.querySelector('header')?.getBoundingClientRect().height ?? 60;
			setTop(headerHeight);
			const rect = inlineRef.current?.getBoundingClientRect();
			if (!rect || rect.bottom > headerHeight + 48) {
				travel = 0;
				setMode('inline');
				return;
			}
			travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta;
			if (travel > SCROLL_THRESHOLD) setMode('strip');
			else if (travel < -SCROLL_THRESHOLD) setMode('overlay');
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	}, [inlineRef]);
	return { mode, setMode, top };
};

interface ISeasonStandings {
	season: TSeason;
	view: TTableView;
	rows: IItemTable[];
	/** Short explanation under the table (zones, read-only league...). */
	hint?: string;
}

export const SeasonStandings = ({ season, view, rows, hint }: ISeasonStandings) => {
	const { myClub } = useContext(SeassonContext);
	const inlineRef = useRef<HTMLDivElement>(null);
	const { mode, setMode, top } = useCollapsingTable(inlineRef);
	const [allStats, setAllStats] = useState(false);

	const isSeasonView = view === 'season';
	const changes = useMemo(() => (isSeasonView ? getPositionChanges(season) : undefined), [season, isSeasonView]);
	const form = useMemo(() => (isSeasonView ? getSeasonForm(season) : undefined), [season, isSeasonView]);
	const zones = getZones(view, season, rows.length);
	const legend = [...new Set(zones.values())];
	const boardProps = { rows, zones, changes, form, myClubUuid: myClub?.uuid };
	const floating = { top, '--max-h': `calc(100vh - ${top + 16}px)` } as CSSProperties;

	const footer = (
		<div className={styles.footer}>
			<div className={styles.legend}>
				{legend.map(zone => (
					<span key={zone}>
						<i className={styles[`zone_${zone}`]} />
						{ZONE_LABEL[zone]}
					</span>
				))}
				{hint && <span className={styles.hint}>{hint}</span>}
			</div>
			<button type='button' className={styles.toggle} onClick={() => setAllStats(v => !v)}>
				{allStats ? 'Compact' : 'All stats'}
			</button>
		</div>
	);

	return (
		<>
			<div ref={inlineRef} className={styles.inline}>
				{allStats ? (
					<div className={styles.full_stats}>
						<Table table={rows} />
					</div>
				) : (
					<Board {...boardProps} />
				)}
				{footer}
			</div>

			{mode === 'strip' && (
				<button
					type='button'
					className={styles.strip}
					style={floating}
					onClick={() => setMode('overlay')}
					aria-label='Show full table'>
					<ol className={styles.strip_list}>
						{rows.map((row, i) => (
							<li
								key={row.club.uuid}
								className={`${styles.chip} ${row.club.uuid === myClub?.uuid ? styles.chip_mine : ''}`}>
								<span className={styles.chip_pos}>{i + 1}</span>
								<ClubBadge className={styles.chip_crest} {...row.club} showChampion={false} />
								<span className={styles.chip_pts}>{row.pts}</span>
							</li>
						))}
					</ol>
					<span className={styles.strip_expand} aria-hidden='true'>
						▾
					</span>
				</button>
			)}

			{mode === 'overlay' && (
				<div className={styles.overlay} style={floating}>
					<Board {...boardProps} />
					<div className={styles.legend}>
						{legend.map(zone => (
							<span key={zone}>
								<i className={styles[`zone_${zone}`]} />
								{ZONE_LABEL[zone]}
							</span>
						))}
					</div>
				</div>
			)}
		</>
	);
};
