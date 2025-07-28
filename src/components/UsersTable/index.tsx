import { Match } from "@/types/match";
import Avatar from "../Avatar";
import Link from "next/link";
import { getPreviousMatchesFromGitHub } from "@/actions/getPreviousMatchesFromGithub";
import Image from "next/image";
import Up from "../Icons/up";

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

export const pointsMap: Record<string, { win: number; lose: number }> = {
  "2:0": { win: 25, lose: 5 },
  "2:1": { win: 20, lose: 10 },
  "1:2": { win: 10, lose: 20 },
  "0:2": { win: 5, lose: 25 },
};
export const calculatePlayerStats = (matches: Match[]): PlayerStats[] => {
  const statsMap: Record<string, PlayerStats> = {};

  const awardPoints = (
    players: string[],
    points: number,
    setsWon: number,
    setsLost: number
  ) => {
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

      const stats = statsMap[player];
      stats.matches += 1;
      stats.points += points;
      stats.setsWon += setsWon;
      stats.setsLost += setsLost;

      if (points > 12.5) {
        stats.wins += 1;
      } else {
        stats.losses += 1;
      }
    }
  };

  matches.forEach((match) => {
    const score1 = match.score["1"];
    const score2 = match.score["2"];
    const team1 = match.players["1"];
    const team2 = match.players["2"];

    const key = `${score1}:${score2}`;
    const reverseKey = `${score2}:${score1}`;

    const team1Points = pointsMap[key] || { win: 0, lose: 0 };
    const team2Points = pointsMap[reverseKey] || { win: 0, lose: 0 };

    awardPoints(team1, team1Points.win, score1, score2);
    awardPoints(team2, team2Points.win, score2, score1);
  });

  return Object.values(statsMap).sort((a, b) => b.points - a.points);
};

type PlayerStatsWithTrend = PlayerStats & {
  trend?: "up" | "down" | "same";
  positionChange?: number;
};
export async function UsersTable({ matches }: { matches: Match[] }) {
  const lastModified = await getLastModifiedDate();
  const playerStats = calculatePlayerStats(matches);
  const previousMatches = await getPreviousMatchesFromGitHub();
  const previousStats = previousMatches
    ? calculatePlayerStats(previousMatches.matches)
    : [];

  const previousPositions = new Map<string, number>();

  previousStats.forEach((player, index) => {
    previousPositions.set(player.name, index);
  });

  const currentStatsWithTrend: PlayerStatsWithTrend[] = playerStats.map(
    (player, index) => {
      const prevIndex = previousPositions.get(player.name);

      let trend: "up" | "down" | "same" | undefined = undefined;
      let positionChange: number | undefined = undefined;

      if (prevIndex === undefined) {
        trend = undefined;
      } else {
        positionChange = prevIndex - index;

        if (positionChange > 0) trend = "up";
        else if (positionChange < 0) trend = "down";
        else trend = "same";
      }

      return {
        ...player,
        trend,
        positionChange,
      };
    }
  );

  return (
    <>
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
          {currentStatsWithTrend.map((player, index) => {
            const playerId = player.name.replace(". ", "").toLowerCase();
            return (
              <tr key={player.name}>
                <td style={{ textAlign: "center" }}>{index + 1}</td>
                <td>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Avatar filename={`${playerId}.png`} />
                    <Link
                      style={{ textDecoration: "underline", cursor: "pointer" }}
                      href={`/players/${playerId}`}
                    >
                      {player.name}
                    </Link>
                    {player.trend === "up" && (
                      <span style={{ color: "green" }}>
                        <Up /> {`+${player.positionChange}`}
                      </span>
                    )}
                    {player.trend === "down" && (
                      <span style={{ color: "red" }}>
                        <Up style={{ transform: "rotate(180deg)" }} />{" "}
                        {`${player.positionChange}`}
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ textAlign: "center" }}>{player.matches}</td>
                <td style={{ textAlign: "center" }}>{player.wins}</td>
                <td style={{ textAlign: "center" }}>
                  {player.setsWon} : {player.setsLost}
                </td>
                <td style={{ textAlign: "center" }}>{player.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p
        style={{
          fontSize: "0.6rem",
          fontStyle: "italic",
          fontWeight: 700,
          color: "#dfdfdf",
        }}
      >
        Zaktualizowano - {lastModified || "brak danych"}.
      </p>
      <p
        style={{
          marginBottom: "1.4rem",
          fontSize: "0.6rem",
          fontStyle: "italic",
          fontWeight: 700,
          color: "#dfdfdf",
        }}
      >
        Punktacja: 2:0 - 25.00 pkt | 2:1 - 20.00 pkt | 1:2 - 10.00 pkt | 0:2 -
        5.00 pkt.
      </p>
    </>
  );
}
