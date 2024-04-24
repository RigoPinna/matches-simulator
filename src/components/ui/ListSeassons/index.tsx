import { useContext, useEffect, useState, useCallback } from 'react';
import { ItemClub, List } from '..';
import styles from './styles.module.css';
import { SeassonContext, TSeason } from '../../../store';
import { useNavigate } from 'react-router-dom';
type TStateSeassons = {
	current: TSeason | undefined;
	all: TSeason[];
};
export const ListSeassons = () => {
	const ctx = useContext(SeassonContext);
	const navigate = useNavigate();
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

	const onGoToSeasson = (uuid: string) => {
		navigate(`/seasson/${uuid}`);
	};
	return (
		<div>
			{seassons.current && (
				<List.Container className={styles.current_seasson} title='Current'>
					<List.Item
						onClick={() => {
							seassons.current?.uuid && onGoToSeasson(seassons.current.uuid);
						}}
						className={styles.seasson_item}>
						<span className={styles.badge}>{seassons.current.number}</span>
						<div className={styles.seasson_info}>
							<h4>Seasson</h4>
						</div>
					</List.Item>
				</List.Container>
			)}
			<List.Container title='All'>
				{seassons.all.map(seasson => (
					<List.Item
						key={seasson.uuid}
						onClick={() => {
							onGoToSeasson(seasson.uuid);
						}}
						className={styles.seasson_item}>
						<span className={styles.badge}>{seasson.number}</span>
						<div className={styles.seasson_info}>
							<h4>Seasson</h4>
							{seasson.winner ? (
								<div className={styles.container_message}>
									<ItemClub {...seasson.winner} className={styles.winner} /> 🏆
								</div>
							) : (
								<p>Current • 🔥</p>
							)}
						</div>
					</List.Item>
				))}
			</List.Container>
		</div>
	);
};
