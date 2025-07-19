import { Match } from "@/types/match";
import Image from "next/image";

type PlayerStats = {
  name: string;
  wins: number;
  losses: number;
  points: number;
  matches: number;
};

const calculatePlayerStats = (matches: Match[]): PlayerStats[] => {
  const statsMap: Record<string, PlayerStats> = {};

  matches.forEach((match) => {
    const score1 = match.score["1"];
    const score2 = match.score["2"];
    const winner = score1 > score2 ? "1" : "2";

    for (const team of ["1", "2"]) {
      const isWinner = team === winner;
      for (const player of match.players[team]) {
        if (!statsMap[player]) {
          statsMap[player] = {
            name: player,
            wins: 0,
            losses: 0,
            points: 0,
            matches: 0,
          };
        }

        statsMap[player].matches += 1;
        statsMap[player].points += match.score[team] * 100;

        if (isWinner) {
          statsMap[player].wins += 1;
          statsMap[player].points += 200;
        } else {
          statsMap[player].losses += 1;
        }
      }
    }
  });

  return Object.values(statsMap).sort((a, b) => b.points - a.points);
};

const calculateTeamStats = (matches: Match[]): TeamStats[] => {
  const teamMap: Record<string, TeamStats> = {};

  matches.forEach((match) => {
    for (const teamKey of ["1", "2"] as const) {
      const players = [...match.players[teamKey]].sort();
      const teamId = players.join(" & ");
      const teamName = players.map((player, index, arr) => (
        <span key={player}>
          {player}
          {index < arr.length - 1 ? ", " : ""}
          <br />
        </span>
      ));

      {
        match.players["1"].map((player, index, arr) => (
          <span key={player}>
            {player}
            {index < arr.length - 1 ? ", " : ""}
            <br />
          </span>
        ));
      }
      const isWinner =
        match.score[teamKey] > match.score[teamKey === "1" ? "2" : "1"];

      if (!teamMap[teamId]) {
        teamMap[teamId] = {
          team: teamId,
          name: teamName,
          wins: 0,
          losses: 0,
          matches: 0,
          winRate: 0,
        };
      }

      teamMap[teamId].matches += 1;
      if (isWinner) {
        teamMap[teamId].wins += 1;
      } else {
        teamMap[teamId].losses += 1;
      }
    }
  });

  // Oblicz winRate
  for (const team of Object.values(teamMap)) {
    team.winRate = Math.round((team.wins / team.matches) * 100);
  }

  return Object.values(teamMap).sort(
    (a, b) => b.winRate - a.winRate || b.matches - a.matches
  );
};

export default async function Home() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/matches`,
    {
      next: { revalidate: 0 },
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch matches: ${res.status}`);
  }

  const data = await res.json();
  const matches: Match[] = data.matches;

  const groupedMatches = matches.reduce<Record<string, Match[]>>(
    (acc, match) => {
      if (!acc[match.date]) acc[match.date] = [];
      acc[match.date].push(match);
      return acc;
    },
    {}
  );

  const sortedDates = Object.keys(groupedMatches).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );
  const playerStats = calculatePlayerStats(matches);
  const teamStats = calculateTeamStats(matches);

  return (
    <main
      style={{
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        margin: "0 auto",
        maxWidth: "600px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1 style={{ marginBottom: 0 }}>🏆 Padwell 🏆</h1>
        <h6
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.1rem",
          }}
        >
          powered by{" "}
          <Image src="/transwell.png" alt="Transwell" width={60} height={15} />
        </h6>
      </div>

      <h3 style={{ marginBottom: "0.5rem" }}>👤 Tabela zawodników</h3>
      <table
        border={1}
        cellPadding={5}
        style={{ marginBottom: "2rem", fontSize: "0.8rem" }}
      >
        <thead>
          <tr className="bg-gray-200">
            <th>Lp</th>
            <th>Gracz</th>
            <th>Mecze</th>
            <th>Wygrane</th>
            <th>Porażki</th>
            <th>Punkty</th>
          </tr>
        </thead>
        <tbody>
          {playerStats.map((player, index) => (
            <tr key={player.name}>
              <td>{index + 1}</td>
              <td>{player.name}</td>
              <td style={{ textAlign: "center" }}>{player.matches}</td>
              <td style={{ textAlign: "center" }}>{player.wins}</td>
              <td style={{ textAlign: "center" }}>{player.losses}</td>
              <td style={{ textAlign: "center" }}>{player.points}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginBottom: "0.5rem" }}>🙎‍♂️🙎‍♂️ Tabela drużyn</h3>
      <table
        border={1}
        cellPadding={5}
        style={{ marginBottom: "2rem", fontSize: "0.8rem" }}
      >
        <thead>
          <tr>
            <th>Lp</th>
            <th>Drużyna</th>
            <th>Mecze</th>
            <th>Wygrane</th>
            <th>Porażki</th>
            <th>% zwycięstw</th>
          </tr>
        </thead>
        <tbody>
          {teamStats.map((team, index) => (
            <tr key={team.team}>
              <td>{index + 1}</td>
              <td>{team.name}</td>
              <td style={{ textAlign: "center" }}>{team.matches}</td>
              <td style={{ textAlign: "center" }}>{team.wins}</td>
              <td style={{ textAlign: "center" }}>{team.losses}</td>
              <td style={{ textAlign: "center" }}>{team.winRate}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginBottom: "0.5rem" }}>🎾 Wyniki meczów</h3>

      {sortedDates.map((date, index) => (
        <details
          key={date}
          className="mb-4 border border-gray-400 rounded w-full"
          open={index === 0}
          style={{ marginBottom: "0.5rem" }}
        >
          <summary style={{ padding: "0.5rem 0", cursor: "pointer" }}>
            {date}
          </summary>
          <table
            border={1}
            cellPadding={5}
            style={{ fontSize: "0.8rem", width: "100%" }}
          >
            <thead>
              <tr>
                <th style={{ width: "5%" }}>Lp</th>
                <th style={{ width: "40%" }}>Drużyna 1</th>
                <th>Wynik</th>
                <th style={{ width: "40%" }}>Drużyna 2</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match, i) => (
                <tr key={match.id}>
                  <td>{i + 1}</td>
                  <td>
                    {[...match.players["1"]]
                      .sort((a, b) => a.localeCompare(b))
                      .map((player, index, arr) => (
                        <span key={player}>
                          {player}
                          {index < arr.length - 1 ? ", " : ""}
                          <br />
                        </span>
                      ))}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {match.score["1"]} : {match.score["2"]}
                  </td>
                  <td>
                    {[...match.players["2"]]
                      .sort((a, b) => a.localeCompare(b))
                      .map((player, index, arr) => (
                        <span key={player}>
                          {player}
                          {index < arr.length - 1 ? ", " : ""}
                          <br />
                        </span>
                      ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      ))}
    </main>
  );
}
