import { Match } from "@/types/match";

type PlayerStats = {
  name: string;
  wins: number;
  losses: number;
  points: number;
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
          statsMap[player] = { name: player, wins: 0, losses: 0, points: 0 };
        }

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

  const playerStats = calculatePlayerStats(matches);

  return (
    <main
      style={{
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        margin: "0 auto",
        maxWidth: "800px",
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
        <h6>powered by Transwell</h6>
      </div>

      <h3 style={{ marginBottom: "0.5rem" }}>👤 Tabela zawodników</h3>
      <table
        border={1}
        cellPadding={5}
        style={{ marginBottom: "2rem", fontSize: "0.8rem" }}
      >
        <thead>
          <tr>
            <th>Lp</th>
            <th>Gracz</th>
            <th>Zwycięstwa</th>
            <th>Porażki</th>
            <th>Punkty</th>
          </tr>
        </thead>
        <tbody>
          {playerStats.map((p, i) => (
            <tr key={p.name}>
              <td>{i + 1}</td>
              <td>{p.name}</td>
              <td>{p.wins}</td>
              <td>{p.losses}</td>
              <td>{p.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 style={{ marginBottom: "0.5rem" }}>🏓 Tabela meczów</h3>
      <table border={1} cellPadding={5} style={{ fontSize: "0.8rem" }}>
        <thead>
          <tr>
            <th>Lp</th>
            <th>Data</th>
            <th>Drużyna 1</th>
            <th>Wynik</th>
            <th>Drużyna 2</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match, i) => (
            <tr key={match.id}>
              <td>{i + 1}</td>
              <td>{match.date}</td>
              <td>
                {match.players["1"].map((player, index, arr) => (
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
                {match.players["2"].map((player, index, arr) => (
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
    </main>
  );
}
