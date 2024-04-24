import styles from './styles.module.css';
import { ItemClub } from '..';

interface IItemTable {
	positions: number;
	club: {
		image: string;
		name: string;
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
	return (
		<tr>
			<td className={`${styles.table_head_club} `}>
				{props.positions}
				<ItemClub
					className={styles.table_head_club_item}
					image={props.club.image}
					name={props.club.name}
				/>
			</td>
			<td className={styles.table_socre_item}>{props.mg}</td>
			<td className={styles.table_socre_item}>{props.mw}</td>
			<td className={styles.table_socre_item}>{props.md}</td>
			<td className={styles.table_socre_item}>{props.ml}</td>
			<td className={`${styles.table_pts} ${styles.table_socre_item}`}>{props.pts}</td>
			<td className={styles.table_socre_item}>{props.gf}</td>
			<td className={styles.table_socre_item}>{props.ga}</td>
			<td className={styles.table_socre_item}>{props.gd}</td>
		</tr>
	);
};
