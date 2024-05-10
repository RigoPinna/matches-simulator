import { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IItemClub, ItemClub, List } from '..';
import { ITeamMatch, SeassonContext, TSeason } from '../../../store';
import styles from './styles.module.css';
import league from '../../../assets/champion.png';
import supercup from '../../../assets/supercup.png';
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

	const history = useMemo(() => seassons.all.sort((a, b) => a.number - b.number), [seassons.all]);

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
							<h4>Season</h4>
						</div>
					</List.Item>
				</List.Container>
			)}
			<List.Container title='History' className={styles.all_seasson}>
				{history.map(seasson => (
					<List.Item
						key={seasson.uuid}
						onClick={() => {
							onGoToSeasson(seasson.uuid);
						}}
						className={styles.seasson_item}>
						<span className={styles.badge}>{seasson.number}</span>
						<div className={styles.seasson_info}>
							<h4>Season</h4>
							{seasson?.winner && Array.isArray(seasson.winner) ? (
								<div className={styles.seasson_winners}>
									<div className={styles.container_message}>
										League: <ItemClub {...seasson.winner[0]} className={styles.winner} />
										🏆
									</div>
									<div className={styles.container_message}>
										Supercup: <ItemClub {...seasson.winner[1]} className={styles.winner} />
										🏆
									</div>
								</div>
							) : (
								<div className={styles.container_message}>
									League:
									<ItemClub {...(seasson?.winner as ITeamMatch)} className={styles.winner} />
									🏆
								</div>
							)}
						</div>
					</List.Item>
				))}
			</List.Container>
		</div>
	);
};
