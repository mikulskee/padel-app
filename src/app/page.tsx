import { Match } from "@/types/match";
import Image from "next/image";

const calculatePlayerStats = (matches: Match[]): PlayerStats[] => {
  const statsMap: Record<string, PlayerStats> = {};

  matches.forEach((match) => {
    const score1 = match.score["1"];
    const score2 = match.score["2"];

    const resultKey = `${score1}:${score2}`;
    const reverseKey = `${score2}:${score1}`;

    const pointsMap: Record<string, { win: number; lose: number }> = {
      "2:0": { win: 25, lose: 5 },
      "2:1": { win: 20, lose: 10 },
      "1:2": { win: 10, lose: 20 },
      "0:2": { win: 5, lose: 25 },
    };

    const isTeam1Winner = score1 > score2;
    const team1Players = match.players["1"];
    const team2Players = match.players["2"];

    const sets = {
      "1": score1,
      "2": score2,
    };

    const getPoints = () => {
      const key = pointsMap[resultKey]
        ? resultKey
        : pointsMap[reverseKey]
        ? reverseKey
        : null;
      return key ? pointsMap[key] : { win: 0, lose: 0 };
    };

    const { win, lose } = getPoints();

    const awardPoints = (
      players: string[],
      isWinner: boolean,
      teamKey: "1" | "2"
    ) => {
      const opponentKey = teamKey === "1" ? "2" : "1";
      for (const player of players) {
        if (!statsMap[player]) {
          statsMap[player] = {
            name: player,
            wins: 0,
            losses: 0,
            points: 0,
            matches: 0,
            setsWon: 0,
            setsLost: 0,
          };
        }

        statsMap[player].matches += 1;
        statsMap[player].points += isWinner ? win : lose;

        if (isWinner) {
          statsMap[player].wins += 1;
        } else {
          statsMap[player].losses += 1;
        }

        statsMap[player].setsWon += sets[teamKey];
        statsMap[player].setsLost += sets[opponentKey];
      }
    };

    awardPoints(team1Players, isTeam1Winner, "1");
    awardPoints(team2Players, !isTeam1Winner, "2");
  });

  return Object.values(statsMap).sort((a, b) => b.points - a.points);
};

const calculateTeamStats = (matches: Match[]): TeamStats[] => {
  const teamMap: Record<string, TeamStats> = {};

  matches.forEach((match) => {
    for (const teamKey of ["1", "2"] as const) {
      const players = [...match.players[teamKey]].sort(); // porządek alfabetyczny
      const teamId = players.join(" & ");
      const teamName = players.map((player, index, arr) => (
        <span key={player}>
          {player}
          {index < arr.length - 1 ? ", " : ""}
          <br />
        </span>
      ));
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

const getLastModifiedDate = async (): Promise<string | null> => {
  const GITHUB_REPO = "mikulskee/padel-app";
  const FILE_PATH = "src/data/matches.json";

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/commits?path=${FILE_PATH}&per_page=1`
  );

  if (!res.ok) return null;

  const data = await res.json();
  const date = data?.[0]?.commit?.author?.date;

  if (!date) return null;

  const localDate = new Date(date);

  const dateFormatted = localDate.toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Europe/Warsaw",
  });

  const time = localDate.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Warsaw",
  });

  return `${dateFormatted} o godz. ${time}`;
};

export default async function Home() {
  const lastModified = await getLastModifiedDate();

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
        padding: "2rem 1rem",
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
          <a
            href="https://transwell.pl"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/transwell.png"
              alt="Transwell"
              width={60}
              height={15}
            />
          </a>
        </h6>
      </div>

      <h3 style={{ marginBottom: "0.5rem" }}>👤 Tabela zawodników</h3>
      <table
        border={1}
        cellPadding={5}
        style={{ marginBottom: "0.2rem", fontSize: "0.8rem" }}
      >
        <thead>
          <tr className="bg-gray-200">
            <th style={{ width: "5%" }}>Lp</th>
            <th>Gracz</th>
            <th style={{ width: "12%" }}>M.</th>
            <th style={{ width: "12%" }}>W.</th>
            <th style={{ width: "12%" }}>Sety</th>
            <th style={{ width: "12%" }}>Pkt</th>
          </tr>
        </thead>
        <tbody>
          {playerStats.map((player, index) => (
            <tr key={player.name}>
              <td style={{ textAlign: "center" }}>{index + 1}</td>
              <td>{player.name}</td>
              <td style={{ textAlign: "center" }}>{player.matches}</td>
              <td style={{ textAlign: "center" }}>{player.wins}</td>
              <td style={{ textAlign: "center" }}>
                {player.setsWon} : {player.setsLost}
              </td>
              <td style={{ textAlign: "center" }}>{player.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p
        style={{
          fontSize: "0.5rem",
          fontStyle: "italic",
          color: "#8a8a8a",
        }}
      >
        Zaktualizowano - {lastModified || "brak danych"}.
      </p>
      <p
        style={{
          marginBottom: "1.4rem",
          fontSize: "0.5rem",
          fontStyle: "italic",
          color: "#8a8a8a",
        }}
      >
        Punktacja: 2:0 - 25.00 pkt | 2:1 - 20.00 pkt | 1:2 - 10.00 pkt | 0:2 -
        5.00 pkt.
      </p>

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
              <td>{team.name}</td>
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

      <h3 style={{ marginBottom: "0.5rem" }}>🎾 Wyniki meczów</h3>

      {sortedDates.map((date, index) => (
        <details
          key={date}
          className="mb-4 border border-gray-400 rounded w-full"
          open={index === 0}
          style={{ marginBottom: "0.5rem" }}
        >
          <summary style={{ padding: "0 0 0.5rem", cursor: "pointer" }}>
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
              {matches
                .filter((match) => match.date === date)
                .map((match, i) => (
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
