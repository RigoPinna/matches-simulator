import styles from './styles.module.css';
import { ItemClub, LastMatches } from '..';
import { useCurrentSeasonParams } from '../../../hooks';

interface IItemTable {
	positions: number;
	club: {
		uuid: string;
		image?: string;
		name: string;
		color?: string;
	};
	mg: number;
	mw: number;
	md: number;
	ml: number;
	pts: number;
	gf: number;
	ga: number;
	gd: number;
}
export const ItemTable = (props: IItemTable) => {
	const { sid } = useCurrentSeasonParams()
	return (
		<tr>
			<td className={`${styles.table_head_club} `}>
				{props.positions}
				<ItemClub
					className={styles.table_head_club_item}
					image={props.club.image}
					name={props.club.name}
					color={props.club.color}
				/>
			</td>
			<td className={styles.table_socre_item}>{props.mg}</td>
			<td className={styles.table_socre_item}>{props.mw}</td>
			<td className={styles.table_socre_item}>{props.md}</td>
			<td className={styles.table_socre_item}>{props.ml}</td>
			<td className={`${styles.table_pts} ${styles.table_socre_item}`}>{props.pts}</td>
			<td className={styles.table_socre_item}>{props.gf}</td>
			<td className={styles.table_socre_item}>{props.ga}</td>
			<td className={styles.table_socre_item}>{props.gd} </td>
			<td className={styles.table_last_matches}><LastMatches seasonId={sid || ''} clubId={props.club.uuid} /></td>
		</tr>
	);
};
