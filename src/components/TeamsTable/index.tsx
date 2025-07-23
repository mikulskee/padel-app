import { Match } from "@/types/match";
import Avatar from "../Avatar";

const calculateTeamStats = (matches: Match[]): TeamStats[] => {
  const teamMap: Record<string, TeamStats> = {};

  matches.forEach((match) => {
    for (const teamKey of ["1", "2"] as const) {
      const players = [...match.players[teamKey]].sort(); // porządek alfabetyczny
      const teamId = players.join(" & ");
      const teamName = players.map((player, index, arr) => {
        const playerId = player.replace(". ", "").toLowerCase();

        return (
          <span
            key={player}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Avatar filename={`${playerId}.png`} />
            {player}
          </span>
        );
      });
      const opponentKey = teamKey === "1" ? "2" : "1";
      const isWinner = match.score[teamKey] > match.score[opponentKey];

      if (!teamMap[teamId]) {
        teamMap[teamId] = {
          team: teamId,
          name: teamName,
          wins: 0,
          losses: 0,
          matches: 0,
          winRate: 0,
          setsWon: 0,
          setsLost: 0,
        };
      }

      teamMap[teamId].matches += 1;
      teamMap[teamId].setsWon += match.score[teamKey];
      teamMap[teamId].setsLost += match.score[opponentKey];

      if (isWinner) {
        teamMap[teamId].wins += 1;
      } else {
        teamMap[teamId].losses += 1;
      }
    }
  });

  for (const team of Object.values(teamMap)) {
    team.winRate =
      team.matches > 0 ? Math.round((team.wins / team.matches) * 100) : 0;
  }

  return Object.values(teamMap).sort(
    (a, b) => b.winRate - a.winRate || b.matches - a.matches
  );
};

export default function TeamsTable({ matches }: { matches: Match[] }) {
  const teamStats = calculateTeamStats(matches);

  return (
    <>
      <h3 style={{ marginBottom: "0.5rem" }}>🙎‍♂️🙎‍♂️ Tabela drużyn</h3>
      <table
        border={1}
        cellPadding={5}
        style={{ marginBottom: "2rem", fontSize: "0.8rem" }}
      >
        <thead>
          <tr>
            <th style={{ width: "5%" }}>Lp</th>
            <th>Drużyna</th>
            <th style={{ width: "12%" }}>M.</th>
            <th style={{ width: "12%" }}>W.</th>
            <th style={{ width: "12%" }}>Sety</th>
            <th style={{ width: "12%" }}>W%</th>
          </tr>
        </thead>
        <tbody>
          {teamStats.map((team, index) => (
            <tr key={team.team}>
              <td style={{ textAlign: "center" }}>{index + 1}</td>
              <td>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {team.name}
                </div>
              </td>
              <td style={{ textAlign: "center" }}>{team.matches}</td>
              <td style={{ textAlign: "center" }}>{team.wins}</td>
              <td style={{ textAlign: "center" }}>
                {team.setsWon} : {team.setsLost}
              </td>
              <td style={{ textAlign: "center" }}>{team.winRate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
