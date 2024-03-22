import styles from './styles.module.css';
import club from '../../../assets/america-logo.png';
import { ItemTable } from './ItemTable';

export const Table = () => {
	return (
		<table className={styles.table}>
			<thead className={styles.table_head}>
				<tr>
					<th className={styles.table_head_club}>Club</th>
					<th>MG</th>
					<th>MW</th>
					<th>MD</th>
					<th>ML</th>
					<th className={styles.table_pts}>Pts</th>
					<th>GF</th>
					<th>GA</th>
					<th>GD</th>
				</tr>
			</thead>
			<tbody className={styles.body}>
				<ItemTable
					positions={1}
					club={{
						image: club,
						name: 'America',
					}}
					mg={5}
					mw={3}
					md={1}
					ml={1}
					pts={9}
					gf={10}
					ga={5}
					gd={5}
				/>
				<ItemTable
					positions={2}
					club={{
						image: club,
						name: 'America',
					}}
					mg={5}
					mw={2}
					md={1}
					ml={2}
					pts={6}
					gf={5}
					ga={5}
					gd={0}
				/>
			</tbody>
		</table>
	);
};
