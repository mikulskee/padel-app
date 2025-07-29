import { fetchMatches } from "@/actions/fetchMatches";
import Avatar from "@/components/Avatar";
import { calculatePlayerStats, pointsMap } from "@/components/UsersTable";
import { Match } from "@/types/match";
import Link from "next/link";
import { Fragment } from "react";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const paramsValues = await params;
  const matches = await fetchMatches();
  function formatName(name: string): string {
    if (!name || name.length < 2) return name;
    const firstInitial = name[0].toUpperCase();
    const lastName = name.slice(1);
    const formattedLastName =
      lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
    return `${firstInitial}. ${formattedLastName}`;
  }

  const playerName = formatName(paramsValues.id);

  const playerStats = calculatePlayerStats(matches);

  const placeInRanking =
    playerStats.findIndex(
      (player) => player.name.toLowerCase() === playerName.toLowerCase()
    ) + 1;

  const getPlayerPoints = (
    playerName: string,
    match: Match
  ): {
    points: number;
    isInTeam1: boolean;
    isInTeam2: boolean;
    hasPlayerWon: boolean;
  } => {
    const { score, players } = match;

    const isInTeam1 = players["1"].includes(playerName);
    const isInTeam2 = players["2"].includes(playerName);

    const playerTeamScore = isInTeam1 ? score["1"] : score["2"];
    const opponentTeamScore = isInTeam1 ? score["2"] : score["1"];
    const key = `${playerTeamScore}:${opponentTeamScore}`;

    const hasPlayerWon =
      (isInTeam1 && match.score["1"] > match.score["2"]) ||
      (isInTeam2 && match.score["2"] > match.score["1"]);

    const pointsMap: Record<string, number> = {
      "2:0": 25,
      "2:1": 20,
      "1:2": 10,
      "0:2": 5,
    };

    const points = pointsMap[key];

    return { points, isInTeam1, isInTeam2, hasPlayerWon };
  };

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
        className="breadcrumbs"
        style={{
          marginBottom: "1rem",
          fontSize: "0.9rem",
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "underline",
            color: "#a4a4a4",
          }}
        >
          Główna
        </Link>{" "}
        &gt;
        <span
          style={{
            marginLeft: "0.5rem",
            fontWeight: "bold",
          }}
        >
          {playerName}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <Avatar filename={`${paramsValues.id}.png`} size="medium" />
        <div>
          <h1 style={{ fontSize: "1.4rem" }}>{playerName}</h1>
          <p style={{ fontSize: "1rem" }}>Ranking: {placeInRanking}</p>
        </div>
      </div>

      <table cellPadding={5} style={{ fontSize: "0.8rem", width: "100%" }}>
        <thead></thead>
        <tbody>
          {matches
            .sort((match) => match.date.localeCompare(match.date))
            .reverse()
            .filter(
              (match) =>
                match.players["1"].includes(playerName) ||
                match.players["2"].includes(playerName)
            )
            .map((match, i) => {
              const { points, isInTeam1, isInTeam2, hasPlayerWon } =
                getPlayerPoints(playerName, match);

              return (
                <Fragment key={match.id}>
                  <tr>
                    <td style={{ width: "15%", fontSize: 10 }}>{match.date}</td>
                    <td style={{ width: "25%" }}>
                      {[...match.players["1"]]
                        .sort((a, b) => a.localeCompare(b))
                        .map((player, index, arr) => {
                          return (
                            <span
                              key={player}
                              style={{
                                fontWeight: isInTeam1 ? "bold" : "normal",
                              }}
                            >
                              {player}
                              {index < arr.length - 1 ? ", " : ""}
                              <br />
                            </span>
                          );
                        })}
                    </td>
                    <td style={{ textAlign: "center", width: "10%" }}>
                      <span
                        style={{
                          fontWeight: isInTeam1 ? "bold" : "normal",
                        }}
                      >
                        {match.score["1"]}
                      </span>
                      {" : "}
                      <span
                        style={{
                          fontWeight: isInTeam2 ? "bold" : "normal",
                        }}
                      >
                        {match.score["2"]}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", width: "25%" }}>
                      {[...match.players["2"]]
                        .sort((a, b) => a.localeCompare(b))
                        .map((player, index, arr) => {
                          return (
                            <span
                              key={player}
                              style={{
                                fontWeight: isInTeam2 ? "bold" : "normal",
                              }}
                            >
                              {player}
                              {index < arr.length - 1 ? ", " : ""}
                              <br />
                            </span>
                          );
                        })}
                    </td>
                    <td style={{ textAlign: "right", width: "8%" }}>
                      {hasPlayerWon ? (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "green",
                            width: 20,
                            height: 20,
                            marginLeft: "auto",
                            color: "white",
                          }}
                        >
                          Z
                        </span>
                      ) : (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "red",
                            width: 20,
                            height: 20,
                            marginLeft: "auto",
                            color: "white",
                          }}
                        >
                          P
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "center", width: "10%" }}>
                      {points} pkt
                    </td>
                  </tr>
                  {i < matches.length - 1 && (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          height: "1px",
                          background: "#ccc",
                          margin: "0.5rem 0",
                        }}
                      />
                    </tr>
                  )}
                </Fragment>
              );
            })}
          <tr>
            <td
              colSpan={5}
              style={{ textAlign: "right", fontWeight: "bold" }}
            ></td>
            <td style={{ textAlign: "center", width: "10%" }}>
              {matches
                .filter(
                  (match) =>
                    match.players["1"].includes(playerName) ||
                    match.players["2"].includes(playerName)
                )
                .reduce((sum, match) => {
                  const { points } = getPlayerPoints(playerName, match);
                  return sum + (points || 0);
                }, 0)}{" "}
              pkt
            </td>
          </tr>
        </tbody>
      </table>
    </main>
  );
}
