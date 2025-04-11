import { useContext, useEffect, useState } from "react";
import { SeassonContext } from "../store";


export const useStatistics = (cid: string) => {
  const { seasons } = useContext(SeassonContext);

  const [statics, setStatics] = useState({
    wins: 0,
    draws: 0,
    losses: 0,
    winPercentage: 0,
    matchesDone: 0
  })

  useEffect(() => {
    const allMatches = seasons.map(season => [
      ...season.fase.regular.matches.matches,
      ...season.fase.semifinal.matches.matches,
      ...season.fase.final.matches.matches]).flat();
    const matchesDone = allMatches.filter(match => match.status === 'DONE');
    const matches = matchesDone.map(match => match.value).flat();
    const matchesByClub = matches.filter(match => match.local.uuid === cid || match.visit.uuid === cid)
    let wins = 0, draws = 0, losses = 0;
    for (const match of matchesByClub) {
      if (typeof match.local.score === 'number' && typeof match.visit.score === 'number') {
        if (match.local.score === match.visit.score) {
          draws++
        } else {
          const winner = (match.local.score > match.visit.score) ? match.local.uuid : match.visit.uuid;

          (winner === cid) ? wins++ : losses++;
        }

      }
    }
    setStatics({
      wins,
      draws,
      losses,
      winPercentage: wins > 0 ? (wins / matchesByClub.length * 100) : 0,
      matchesDone: matchesByClub.length
    })
  }, [])
  return statics
}
