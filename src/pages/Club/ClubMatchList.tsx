import { useEffect, useState } from 'react';
import { MATCH_KIND_LABEL, TClubMatch, TMatchKind, TMatchResult } from '../../helpers';
import { ClubBadge } from '../../components/ui';
import styles from './matches.module.css';

const PAGE_SIZE = 30;

const RESULT_LABEL: Record<TMatchResult, string> = { WIN: 'W', DRAW: 'D', LOSS: 'L' };
const KIND_CLASS: Record<TMatchKind, string> = {
	LEAGUE: styles.tag_league,
	SUPERCUP: styles.tag_supercup,
	WORLD_CUP: styles.tag_world_cup,
};
const RESULT_CLASS: Record<TMatchResult, string> = {
	WIN: styles.result_win,
	DRAW: styles.result_draw,
	LOSS: styles.result_loss,
};

const MatchRow = ({ item, cid }: { item: TClubMatch; cid: string }) => {
	const { local, visit } = item.match;
	const team = (side: typeof local, align: 'left' | 'right') => (
		<span
			className={`${styles.team} ${align === 'right' ? styles.team_right : ''} ${side.uuid === cid ? styles.team_own : ''}`}>
			<ClubBadge className={styles.crest} {...side} />
			<span className={styles.team_name}>{side.name}</span>
		</span>
	);
	return (
		<li className={styles.row}>
			<span
				className={`${styles.result} ${RESULT_CLASS[item.result]}`}
				aria-label={item.result.toLowerCase()}>
				{RESULT_LABEL[item.result]}
			</span>
			<div className={styles.row_main}>
				<div className={styles.score_line}>
					{team(local, 'left')}
					<span className={styles.score}>
						{local.score} - {visit.score}
					</span>
					{team(visit, 'right')}
				</div>
				<div className={styles.meta}>
					<span className={`${styles.tag} ${KIND_CLASS[item.kind]}`}>{MATCH_KIND_LABEL[item.kind]}</span>
					<span>{item.stage}</span>
				</div>
			</div>
		</li>
	);
};

interface IClubMatchList {
	cid: string;
	matches: TClubMatch[];
	onReset: () => void;
	hasFilters: boolean;
}

/** Club matches grouped by competition (newest first), paginated. */
export const ClubMatchList = ({ cid, matches, onReset, hasFilters }: IClubMatchList) => {
	const [visible, setVisible] = useState(PAGE_SIZE);
	useEffect(() => setVisible(PAGE_SIZE), [matches]);

	if (matches.length === 0) {
		return (
			<div className={styles.empty}>
				<p>{hasFilters ? 'No matches with these filters' : 'No matches played yet'}</p>
				{hasFilters && (
					<button type='button' className={styles.empty_reset} onClick={onReset}>
						Reset filters
					</button>
				)}
			</div>
		);
	}

	// Consecutive matches of the same competition share a header.
	const groups: { competition: string; items: TClubMatch[] }[] = [];
	for (const item of matches.slice(0, visible)) {
		const last = groups[groups.length - 1];
		if (last && last.competition === item.competition) last.items.push(item);
		else groups.push({ competition: item.competition, items: [item] });
	}

	return (
		<>
			{groups.map((group, i) => (
				<section key={`${group.competition}-${i}`} className={styles.group}>
					<h4 className={styles.group_title}>{group.competition}</h4>
					<ul className={styles.card}>
						{group.items.map(item => (
							<MatchRow key={`${item.match.uuid}`} item={item} cid={cid} />
						))}
					</ul>
				</section>
			))}
			{visible < matches.length && (
				<button
					type='button'
					className={styles.more}
					onClick={() => setVisible(v => v + PAGE_SIZE)}>
					Show more ({matches.length - visible})
				</button>
			)}
		</>
	);
};
