import { fetchMatches } from "@/actions/fetchMatches";
import Avatar from "@/components/Avatar";
import { calculatePlayerStats } from "@/components/UsersTable";
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
          color: "#a4a4a4",
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "underline",
          }}
        >
          Główna
        </Link>{" "}
        &gt;
        <span
          style={{
            marginLeft: "0.5rem",
            color: "#fff",
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
              const isPlayerInTeam1 = match.players["1"].includes(playerName);
              const isPlayerInTeam2 = match.players["2"].includes(playerName);
              const hasPlayerWon =
                (isPlayerInTeam1 && match.score["1"] > match.score["2"]) ||
                (isPlayerInTeam2 && match.score["2"] > match.score["1"]);
              return (
                <Fragment key={match.id}>
                  <tr>
                    <td>{match.date}</td>
                    <td>
                      {[...match.players["1"]]
                        .sort((a, b) => a.localeCompare(b))
                        .map((player, index, arr) => {
                          return (
                            <span
                              key={player}
                              style={{
                                fontWeight: isPlayerInTeam1 ? "bold" : "normal",
                              }}
                            >
                              {player}
                              {index < arr.length - 1 ? ", " : ""}
                              <br />
                            </span>
                          );
                        })}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span
                        style={{
                          fontWeight: isPlayerInTeam1 ? "bold" : "normal",
                        }}
                      >
                        {match.score["1"]}
                      </span>
                      {" : "}
                      <span
                        style={{
                          fontWeight: isPlayerInTeam2 ? "bold" : "normal",
                        }}
                      >
                        {match.score["2"]}
                      </span>
                    </td>
                    <td>
                      {[...match.players["2"]]
                        .sort((a, b) => a.localeCompare(b))
                        .map((player, index, arr) => {
                          return (
                            <span
                              key={player}
                              style={{
                                fontWeight: isPlayerInTeam2 ? "bold" : "normal",
                              }}
                            >
                              {player}
                              {index < arr.length - 1 ? ", " : ""}
                              <br />
                            </span>
                          );
                        })}
                    </td>
                    <td>
                      {hasPlayerWon ? (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "green",
                            width: 20,
                            height: 20,
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
                          }}
                        >
                          P
                        </span>
                      )}
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
        </tbody>
      </table>
    </main>
  );
}
