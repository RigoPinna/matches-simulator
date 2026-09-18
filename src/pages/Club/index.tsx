import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "../../components/icons";
import { Main } from "../../components/layouts";
import { Button, ClubBadge, Header, LastMatches, MatchList } from "../../components/ui";
import { useContext } from "react";
import { SeassonContext } from "../../store";
import lige from '../../assets/champion.png'
import supercup from '../../assets/supercup.png'
import styles from "./styles.module.css";
import { useStatistics } from "../../hooks/";
export const ClubPage = () => {
    const navigate = useNavigate();
    const { cid } = useParams();
    const { clubs, plateClubs, seasons } = useContext(SeassonContext);
    const [statistics, lastMatches] = useStatistics(cid || '');
    const club = clubs.find(({ uuid }) => uuid === cid) || plateClubs.find(({ uuid }) => uuid === cid);

    if (!club) {
        return <div>Club not found</div>;
    }
    const clubSeasonsHistory = seasons
        .filter(season => season.table.some(item => item.club.uuid === cid))
        .sort((a, b) => a.number - b.number);
    const lastClubSeason = clubSeasonsHistory[clubSeasonsHistory.length - 1];
    return (
        <>
            <Header>
                <Button.Secondary
                    onClick={() => navigate(-1)}>
                    <ArrowLeft />
                    Back
                </Button.Secondary>
                <h1>Club</h1>
            </Header>
            <Main>
                <div className={styles.header}>
                    <ClubBadge
                        className={styles.club_image}
                        image={club?.image}
                        name={club?.name || ''}
                        color={club?.color}
                    />
                    <h2>{club?.name}</h2>
                    <LastMatches
                        showtitles
                        clubId={club.uuid}
                        seasonId={lastClubSeason?.uuid || ''} />

                </div>
                <ul className={styles.list}>
                    <li className={styles.list_item}>
                        <p className={styles.number_trophy}>{club.champions}</p>
                        <h3 className={styles.title}>Leagues</h3>
                        <img src={lige} alt="champion" className={styles.champ} />
                    </li>
                    <li className={styles.list_item}>
                        <p className={styles.number_trophy}>{club.supercups}</p>
                        <h3 className={styles.title}>Supercups</h3>
                        <img src={supercup} alt="champion" className={styles.champ} />
                    </li>
                    <li className={styles.list_item}>
                        <p className={styles.number_trophy}>{statistics.winPercentage.toFixed(1)}%</p>
                        <div className={styles.statistic_wrapper}>
                            <div className={styles.statistic}><p>{statistics.wins}</p>W</div>
                            <div className={styles.statistic}><p>{statistics.draws}</p>D</div>
                            <div className={styles.statistic}><p>{statistics.losses}</p>L</div>

                        </div>
                        <h3 className={styles.title}>Winning percentage</h3>
                    </li>
                </ul>
                <MatchList isCurrent={false} matches={{
                    jid: 'none',
                    status: 'DONE',
                    value: lastMatches
                }}
                    title="All matches"
                    type="REGULAR"

                />
            </Main>
        </>
    )
}
