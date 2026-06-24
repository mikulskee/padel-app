import { Match } from "@/types/match";
import { UsersTable } from "@/components/UsersTable";
import TeamsTable from "@/components/TeamsTable";
import ResultsTable from "@/components/ResultsTable";
import Image from "next/image";
import Link from "next/link";

type DashboardProps = {
	matches: Match[];
	activeYear: number;
	currentYear: number;
	availableYears: number[];
};

const SeasonLink = ({ href, label, active }: { href: string; label: string; active: boolean }) => (
	<Link
		href={href}
		style={{
			padding: "0.25rem 0.6rem",
			borderRadius: "999px",
			border: "1px solid #ccc",
			textDecoration: "none",
			fontWeight: active ? 700 : 400,
			background: active ? "#222" : "transparent",
			color: active ? "#fff" : "inherit",
		}}
	>
		{label}
	</Link>
);

export default function Dashboard({
	matches,
	activeYear,
	currentYear,
	availableYears,
}: DashboardProps) {
	const isCurrentSeason = activeYear === currentYear;
	const pastYears = availableYears.filter((year) => year !== currentYear);

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
				<Image src="/logo.png" height={96.9238} width={250} alt="logo" />
				<h6
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: "0.1rem",
						marginLeft: "66px",
					}}
				>
					powered by{" "}
					<a href="https://transwell.pl" target="_blank" rel="noopener noreferrer">
						<Image src="/transwell.png" alt="Transwell" width={60} height={15} />
					</a>
				</h6>
			</div>

			<nav
				style={{
					display: "flex",
					flexWrap: "wrap",
					gap: "0.5rem",
					justifyContent: "center",
					marginBottom: "1.5rem",
					fontSize: "0.85rem",
				}}
			>
				<SeasonLink href="/" label={`Sezon ${currentYear}`} active={isCurrentSeason} />
				{pastYears.map((year) => (
					<SeasonLink
						key={year}
						href={`/${year}`}
						label={`Sezon ${year}`}
						active={activeYear === year}
					/>
				))}
			</nav>

			{matches.length === 0 ? (
				<p
					style={{
						textAlign: "center",
						opacity: 0.7,
						marginTop: "2rem",
					}}
				>
					Brak meczów w sezonie {activeYear}. Pierwsze wyniki pojawią się tutaj, gdy tylko
					zostaną dodane.
				</p>
			) : (
				<>
					<UsersTable matches={matches} activeYear={activeYear} />
					<TeamsTable matches={matches} />
					<ResultsTable matches={matches} />
				</>
			)}
		</main>
	);
}
