import { useContext, useEffect, useState } from "react";
import { Item } from "./Item";
import styles from "./styles.module.css";
import { SeassonContext, TMatches } from "../../../store";
type TProps = {
    seasonId: string
    showtitles?: boolean;
    clubId: string;
}
type TMatch = {
    result: "WIN" | "LOST" | "DRAW" | "WITHOUT"
}
export const LastMatches = ({ showtitles = false, clubId, seasonId }: TProps) => {
    const { seasons } = useContext(SeassonContext);
    const [matches, setMatches] = useState<TMatch[]>([])
    useEffect(() => {
        const currentSeason = seasons.find(season => season.uuid === seasonId);
        if (currentSeason) {
            const allMatches = [...currentSeason.fase.regular.matches.matches, ...currentSeason.fase.semifinal.matches.matches, ...currentSeason.fase.final.matches.matches]

            const matchesDone = allMatches.reduce((acc, match) => {
                const matches = match.value.filter((item) => item.status === "DONE");
                return [...acc, ...matches]
            }, [] as TMatches[])

            const matchesClub = matchesDone.filter(match => match.visit.uuid === clubId || match.local.uuid === clubId).reverse();
            const lastMathes: TMatch[] = [];
            for (let i = 0; i < 5; i++) {
                if (matchesClub[i]) {
                    const { local, visit } = matchesClub[i];
                    let winner = '';
                    if (typeof local.score === "number" && typeof visit?.score === "number") {
                        if (local.score === visit.score) {
                            lastMathes.push({
                                result: "DRAW"
                            })

                        } else {
                            winner = local.score > visit.score ? local.uuid : visit.uuid;
                            lastMathes.push({
                                result: winner === clubId ? "WIN" : "LOST"
                            })

                        }
                    } else {
                        lastMathes.push({
                            result: "WITHOUT"
                        })
                    }
                    // lastMathes.push()
                } else {
                    lastMathes.push({
                        result: "WITHOUT"
                    })
                }

            }

            setMatches(lastMathes)
        }

    }, [clubId, seasonId, seasons])

    return (
        <div className={styles.wrapper}>
            <ul className={styles.list}>
                {
                    matches.map((item, index) => (
                        <Item key={`${clubId}${seasonId}${item.result}${index}`} type={item.result} />
                    ))
                }
            </ul>
            {showtitles && <p className={styles.text}>
                last matches
            </p>}
        </div>
    )
}
