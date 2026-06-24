import { fetchMatches } from "@/actions/fetchMatches";
import Dashboard from "@/components/Dashboard";
import { filterMatchesByYear, getAvailableYears, getCurrentYear } from "@/lib/seasons";

export default async function Home() {
	const allMatches = await fetchMatches();
	const currentYear = getCurrentYear();

	const matches = filterMatchesByYear(allMatches, currentYear);
	const availableYears = getAvailableYears(allMatches);

	return (
		<Dashboard
			matches={matches}
			activeYear={currentYear}
			currentYear={currentYear}
			availableYears={availableYears}
		/>
	);
}
