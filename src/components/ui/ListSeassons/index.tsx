import { useContext, useEffect, useState, useCallback } from 'react';
import { List } from '..';
import styles from './styles.module.css';
import { SeassonContext, TSeason } from '../../../store';
type TStateSeassons = {
	current: TSeason | undefined;
	all: TSeason[];
};
export const ListSeassons = () => {
	const ctx = useContext(SeassonContext);
	const [seassons, setSeassons] = useState<TStateSeassons>({
		current: undefined,
		all: [],
	});
	const getFilterSeassons = useCallback((): TStateSeassons => {
		return {
			current: ctx.seasons.find(seasson => seasson.isCurrent === true),
			all: ctx.seasons,
		};
	}, [ctx.seasons]);

	useEffect(() => {
		setSeassons(getFilterSeassons());
	}, [ctx.seasons]);

	return (
		<div>
			<List.Container className={styles.current_seasson} title='Current'>
				{seassons.current && (
					<List.Item onClick={() => {}} className={styles.seasson_item}>
						<span className={styles.badge}>{seassons.current.number}</span>
						<div className={styles.seasson_info}>
							<h4>Seasson</h4>
						</div>
					</List.Item>
				)}
			</List.Container>
			<List.Container title='All'>
				{seassons.all.map(seasson => (
					<List.Item key={seasson.uuid} onClick={() => {}} className={styles.seasson_item}>
						<span className={styles.badge}>{seasson.number}</span>
						<div className={styles.seasson_info}>
							<h4>Seasson</h4>
							{seasson?.winder && <p>{seasson.winder} • 🏆</p>}
						</div>
					</List.Item>
				))}
			</List.Container>
		</div>
	);
};
