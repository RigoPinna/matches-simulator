import { Fragment, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ItemClub, List } from '..';
import { ITeamMatch, SeassonContext, TLeague, TSeason } from '../../../store';
import styles from './styles.module.css';
type TStateSeassons = {
	current: TSeason | undefined;
	all: TSeason[];
};
interface IListSeassons {
	league: TLeague;
}
export const ListSeassons = ({ league }: IListSeassons) => {
	const ctx = useContext(SeassonContext);
	const navigate = useNavigate();
	const [seassons, setSeassons] = useState<TStateSeassons>({
		current: undefined,
		all: [],
	});
	const leagueSeassons = useMemo(
		() => ctx.seasons.filter(seasson => seasson.league === league),
		[ctx.seasons, league],
	);
	const getFilterSeassons = useCallback((): TStateSeassons => {
		return {
			current: leagueSeassons.find(seasson => seasson.isCurrent === true),
			all: leagueSeassons,
		};
	}, [leagueSeassons]);

	const history = useMemo(() => seassons.all.sort((a, b) => a.number - b.number), [seassons.all]);

	useEffect(() => {
		setSeassons(getFilterSeassons());
	}, [leagueSeassons]);

	const onGoToSeasson = (uuid: string) => {
		navigate(`/seasson/${uuid}`);
	};
	return (
		<div>
			{seassons.current && (
				<List.Container className={styles.current_seasson} title='Current season:'>
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
			<List.Container title='History seasons:' className={styles.all_seasson}>
				{history.map(seasson => (
					<Fragment key={seasson.uuid}>
					<List.Item
						onClick={() => {
							onGoToSeasson(seasson.uuid);
						}}
						className={styles.seasson_item}>
						<span className={styles.badge}>{seasson.number}</span>
						<div className={styles.seasson_info}>
							<h4>Season</h4>
							{Array.isArray(seasson.winner) ? (
								<div className={styles.seasson_winners}>
									{seasson.winner[0].uuid === seasson.winner[1].uuid ? (
										<>
											<div className={styles.container_message}>
												League & Supercup:{' '}
												<ItemClub {...seasson.winner[0]} className={styles.winner} />
												🏆🏆
											</div>
										</>
									) : (
										<>
											<div className={styles.container_message}>
												League: <ItemClub {...seasson.winner[0]} className={styles.winner} />
												🏆
											</div>
											<div className={styles.container_message}>
												Supercup: <ItemClub {...seasson.winner[1]} className={styles.winner} />
												🏆
											</div>
										</>
									)}
								</div>
							) : (
								<>
									{seasson?.winner ? (
										<div className={styles.container_message}>
											League:
											<ItemClub {...(seasson?.winner as ITeamMatch)} className={styles.winner} />
											🏆
										</div>
									) : (
										<p>Current 🔥</p>
									)}
								</>
							)}
						</div>
					</List.Item>
					{seasson.promotion && (
						<li className={styles.promotion_item}>
							<div className={styles.container_message}>
								⬆️ Promoted:
								<ItemClub {...seasson.promotion.promoted} className={styles.winner} />
							</div>
							<div className={styles.container_message}>
								⬇️ Relegated:
								<ItemClub {...seasson.promotion.relegated} className={styles.winner} />
							</div>
						</li>
					)}
					</Fragment>
				))}
			</List.Container>
		</div>
	);
};
