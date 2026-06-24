import { fetchMatches } from "@/actions/fetchMatches";
import Dashboard from "@/components/Dashboard";
import { filterMatchesByYear, getAvailableYears, getCurrentYear } from "@/lib/seasons";
import { notFound, redirect } from "next/navigation";

export default async function SeasonPage({ params }: { params: Promise<{ year: string }> }) {
	const { year: yearParam } = await params;

	if (!/^\d{4}$/.test(yearParam)) {
		notFound();
	}

	const year = Number(yearParam);
	const currentYear = getCurrentYear();

	if (year === currentYear) {
		redirect("/");
	}

	const allMatches = await fetchMatches();
	const matches = filterMatchesByYear(allMatches, year);

	if (matches.length === 0) {
		notFound();
	}

	const availableYears = getAvailableYears(allMatches);

	return (
		<Dashboard
			matches={matches}
			activeYear={year}
			currentYear={currentYear}
			availableYears={availableYears}
		/>
	);
}
