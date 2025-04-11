import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "../../components/icons";
import { Main } from "../../components/layouts";
import { Button, Header, LastMatches } from "../../components/ui";
import { useContext } from "react";
import { SeassonContext } from "../../store";
import lige from '../../assets/champion.png'
import supercup from '../../assets/supercup.png'
import styles from "./styles.module.css";
import { useStatistics } from "../../hooks/useStatistics";
export const ClubPage = () => {
    const navigate = useNavigate();
    const { cid } = useParams();
    const { clubs, seasons } = useContext(SeassonContext);
    const statistics = useStatistics(cid || '')
    const club = clubs.find(({ uuid }) => uuid === cid);
    if (!club) {
        return <div>Club not found</div>;
    }
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
                    <img src={club?.image} alt={club?.name} />
                    <h2>{club?.name}</h2>
                    <LastMatches
                        showtitles
                        clubId={club.uuid}
                        seasonId={seasons[seasons.length - 1]?.uuid || ''} />

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
            </Main>
        </>
    )
}
