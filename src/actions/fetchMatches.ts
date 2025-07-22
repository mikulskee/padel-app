import { Match } from "@/types/match";

export async function fetchMatches(): Promise<Match[]> {
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

  return matches;
}
