import { v4 as getUuid } from "uuid";
import "./App.css";
type TTemas = {
  team: string;
  image?: string;
  uuid: string;
  matches?: number;
  points?: number;
  gf?: number;
  ga?: number;
  gd?: number;
  wins?: number;
  draws?: number;
  loses?: number;
};
type TTeamMatch = {
  uuid: string;
  name: string;
  score: number;
};
type TMatches = {
  uuid: string;
  local: TTeamMatch;
  visit: TTeamMatch;
};
const teams: TTemas[] = [
  {
    uuid: getUuid(),
    team: "Club America",
    image:
      "data:image/png;base64,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",
    points: 0,
    gd: 0,
    draws: 0,
    ga: 0,
    gf: 0,
    loses: 0,
    matches: 0,
    wins: 0,
  },
  {
    uuid: getUuid(),
    team: "Monterrey",
    image:
      "data:image/png;base64,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",
    points: 0,
    gd: 0,
    draws: 0,
    ga: 0,
    gf: 0,
    loses: 0,
    matches: 0,
    wins: 0,
  },
  {
    uuid: getUuid(),
    team: "Tigres",
    image:
      "https://ssl.gstatic.com/onebox/media/sports/logos/TOy4xdFatfWxg_x05gvE0w_48x48.png",
    points: 0,
    gd: 0,
    draws: 0,
    ga: 0,
    gf: 0,
    loses: 0,
    matches: 0,
    wins: 0,
  },
  {
    uuid: getUuid(),
    team: "Chivas",
    image:
      "https://ssl.gstatic.com/onebox/media/sports/logos/hyOGnulKdtjyFHJoODEtBg_48x48.png",
    points: 0,
    gd: 0,
    draws: 0,
    ga: 0,
    gf: 0,
    loses: 0,
    matches: 0,
    wins: 0,
  },
  {
    uuid: getUuid(),
    team: "Santos",
    image:
      "https://ssl.gstatic.com/onebox/media/sports/logos/4zBpLwBjbUvhucdSgYk25g_48x48.png",
    points: 0,
    gd: 0,
    draws: 0,
    ga: 0,
    gf: 0,
    loses: 0,
    matches: 0,
    wins: 0,
  },
  {
    uuid: getUuid(),
    team: "Cruz Azul",
    image:
      "https://ssl.gstatic.com/onebox/media/sports/logos/IfE_cFETO6IfMcJROKpLdg_48x48.png",
    points: 0,
    gd: 0,
    draws: 0,
    ga: 0,
    gf: 0,
    loses: 0,
    matches: 0,
    wins: 0,
  },
];
function App() {
<<<<<<< Updated upstream
  const getMatches = () => {
    const matches: TMatches[] = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        matches.push({
          uuid: getUuid(),
          local: {
            uuid: teams[i].uuid,
            name: teams[i].team,
            score: 0,
          },
          visit: {
            uuid: teams[j].uuid,
            name: teams[j].team,
            score: 0,
          },
        });
      }
    }
    return matches;
  };
  const getJourney = (matches: TMatches[]) => {
    const numberOfJourney = teams.length - 1;
    const matchesByJourney = matches.length / teams.length;
    let matchesLength = matches.length;
    const journeys = [];
    let matchesCopy = [...matches];
    for (let i = 0; i < numberOfJourney; i++) {
      const journey = [];
      for (let j = 0; j < matchesByJourney; j++) {
        const match = matchesCopy[Math.floor(Math.random() * matchesLength)];
        matchesCopy = [...matchesCopy.filter((m) => m.uuid !== match.uuid)];
        journey.push(match);
        matchesLength--;
      }
      journeys.push(journey);
    }
    return journeys;
  };
  const matches = getMatches();
  const journey = getJourney(matches);
  return (
    <>
      <table className="blueTable">
        <thead>
          <tr>
            <th>Club</th>
            <th>MG</th>
            <th>W</th>
            <th>D</th>
            <th>L</th>
            <th>Pts</th>
            <th>GF</th>
            <th>GA</th>
            <th>GD</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.uuid}>
              <td>
                <img src={team.image} />
                {team.team}
              </td>
              <td>{team.matches}</td>
              <td>{team.wins}</td>
              <td>{team.draws}</td>
              <td>{team.loses}</td>
              <td>{team.points}</td>
              <td>{team.gf}</td>
              <td>{team.ga}</td>
              <td>{team.gd}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
=======
	const getMatches = () => {
		const matches: TMatches[] = [];
		for (let i = 0; i < teams.length; i++) {
			for (let j = i + 1; j < teams.length; j++) {
				matches.push({
					uuid: getUuid(),
					local: {
						uuid: teams[i].uuid,
						name: teams[i].team,
						score: 0,
					},
					visit: {
						uuid: teams[j].uuid,
						name: teams[j].team,
						score: 0,
					},
				});
			}
		}
		return matches;
	};
	const getJourney = (matches: TMatches[]) => {
		const numberOfJourney = teams.length - 1;
		const matchesByJourney = matches.length / teams.length;
		let matchesLength = matches.length;
		const journeys = [];
		let matchesCopy = [...matches];
		for (let i = 0; i < numberOfJourney; i++) {
			const journey = [];
			for (let j = 0; j < matchesByJourney; j++) {
				const match = matchesCopy[Math.floor(Math.random() * matchesLength)];
				matchesCopy = [...matchesCopy.filter(m => m.uuid !== match.uuid)];
				journey.push(match);
				matchesLength--;
			}
			journeys.push(journey);
		}
		return journeys;
	};
	const matches = getMatches();
	const journeys = getJourney(matches);
	return (
		<>
			<table className='blueTable'>
				<thead>
					<tr>
						<th>Club</th>
						<th>MG</th>
						<th>W</th>
						<th>D</th>
						<th>L</th>
						<th>Pts</th>
						<th>GF</th>
						<th>GA</th>
						<th>GD</th>
					</tr>
				</thead>
				<tbody>
					{teams.map(team => (
						<tr key={team.uuid}>
							<td>
								<img src={team.image} />
								{team.team}
							</td>
							<td>{team.matches}</td>
							<td>{team.wins}</td>
							<td>{team.draws}</td>
							<td>{team.loses}</td>
							<td>{team.points}</td>
							<td>{team.gf}</td>
							<td>{team.ga}</td>
							<td>{team.gd}</td>
						</tr>
					))}
				</tbody>
			</table>
		</>
	);
>>>>>>> Stashed changes
}

export default App;
