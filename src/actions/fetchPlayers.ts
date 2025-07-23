import { Match } from "@/types/match";

export async function fetchPlayers(): Promise<string[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/players`,
    {
      next: { revalidate: 0 },
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch players: ${res.status}`);
  }

  const data = await res.json();

  const players: string[] = data.matches
    .map((match: Match) => {
      const firstTeamPlayers = match.players["1"].flat();
      const secondTeamPlayers = match.players["2"].flat();
      return [...firstTeamPlayers, ...secondTeamPlayers];
    })
    .flat();

  const uniquePlayers = new Set(players);

  return Array.from(uniquePlayers);
}
