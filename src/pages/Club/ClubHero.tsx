import { CSSProperties } from 'react';
import { IClub, LEAGUE_INFO } from '../../store';
import { TChampionTitle, TMatchResult, TNextMatch, TSeasonRow, ordinal } from '../../helpers';
import { ClubBadge } from '../../components/ui';
import styles from './profile.module.css';

const RIBBON_CLASS: Record<TChampionTitle['kind'], string> = {
	WORLD_CUP: '',
	LEAGUE: styles.ribbon_league,
	SUPERCUP: styles.ribbon_supercup,
};

const RESULT_LETTER: Record<TMatchResult, string> = { WIN: 'W', DRAW: 'D', LOSS: 'L' };
const RESULT_CLASS: Record<TMatchResult, string> = {
	WIN: styles.form_win,
	DRAW: styles.form_draw,
	LOSS: styles.form_loss,
};

interface IClubHero {
	club: IClub;
	/** Latest season the club played (or is playing). */
	latest?: TSeasonRow;
	/** Last results, oldest → newest. */
	form: TMatchResult[];
	next?: TNextMatch;
	/** Titles the club currently holds (World Cup, league). */
	titles: TChampionTitle[];
}

/** Club header: crest, name, where it stands now, recent form and next match. */
export const ClubHero = ({ club, latest, form, next, titles }: IClubHero) => (
	<section className={styles.hero} style={{ '--club-color': club.color } as CSSProperties}>
		<ClubBadge className={styles.hero_crest} {...club} />
		<h2 className={styles.hero_name}>{club.name}</h2>

		{latest && (
			<p className={styles.hero_status}>
				{ordinal(latest.position)} · {LEAGUE_INFO[latest.league].name} · Season {latest.number}
				{latest.isCurrent && <span className={styles.live}>Live</span>}
			</p>
		)}
		{titles.length > 0 && (
			<div className={styles.ribbons}>
				{titles.map(title => (
					<span
						key={title.kind}
						className={`${styles.ribbon} ${RIBBON_CLASS[title.kind]}`}>
						🏆 {title.label}
					</span>
				))}
			</div>
		)}

		{form.length > 0 && (
			<div className={styles.form_block}>
				<ol className={styles.form} aria-label='Last matches, oldest to newest'>
					{form.map((result, i) => (
						<li key={i} className={`${styles.form_item} ${RESULT_CLASS[result]}`}>
							{RESULT_LETTER[result]}
						</li>
					))}
				</ol>
				<span className={styles.form_label}>Last {form.length}</span>
			</div>
		)}

		{next && (
			<div className={styles.next}>
				<span className={styles.next_label}>Next</span>
				<span className={styles.next_vs}>vs</span>
				<ClubBadge className={styles.next_crest} {...next.opponent} />
				<span className={styles.next_name}>{next.opponent.name}</span>
				<span className={styles.next_meta}>
					{next.isHome ? 'Home' : 'Away'} · {next.stage}
				</span>
			</div>
		)}
	</section>
);
