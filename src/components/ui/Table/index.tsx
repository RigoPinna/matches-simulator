import styles from './styles.module.css';
import { ItemTable } from './ItemTable';
import { IItemTable } from '../../../store';

interface ITable {
	table: IItemTable[];
}
export const Table = ({ table }: ITable) => {
	return (
		<table className={styles.table}>
			<thead className={styles.table_head}>
				<tr>
					<th className={`${styles.table_head_club}`}>Club</th>
					<th>MG</th>
					<th>W</th>
					<th>D</th>
					<th>L</th>
					<th className={styles.table_pts}>Pts</th>
					<th>GF</th>
					<th>GA</th>
					<th>GD</th>
				</tr>
			</thead>
			<tbody className={styles.body}>
				{table.map((team, index) => (
					<ItemTable key={`table-item-${team.club.image}`} positions={index + 1} {...team} />
				))}
			</tbody>
		</table>
	);
};
