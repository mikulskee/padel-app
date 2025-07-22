import { Match } from "@/types/match";

export default function ResultsTable({ matches }: { matches: Match[] }) {
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
  return (
    <>
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
    </>
  );
}
