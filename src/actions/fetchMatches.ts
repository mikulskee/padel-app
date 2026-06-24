import { getMatchesFromFile } from "@/lib/getMatchesFromFile";
import { Match } from "@/types/match";

export async function fetchMatches(): Promise<Match[]> {
	const data = await getMatchesFromFile();
	return data.matches;
}
