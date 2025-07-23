import { fetchMatches } from "@/actions/fetchMatches";
import Avatar from "@/components/Avatar";
import ResultsTable from "@/components/ResultsTable";
import TeamsTable from "@/components/TeamsTable";
import { UsersTable } from "@/components/UsersTable";
import Image from "next/image";

export default async function Home() {
  const matches = await fetchMatches();

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
        <h1 style={{ marginBottom: 0 }}>🏆 Padwell 🏆</h1>
        <h6
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.1rem",
          }}
        >
          powered by{" "}
          <a
            href="https://transwell.pl"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/transwell.png"
              alt="Transwell"
              width={60}
              height={15}
            />
          </a>
        </h6>
      </div>

      <UsersTable matches={matches} />
      <TeamsTable matches={matches} />
      <ResultsTable matches={matches} />
    </main>
  );
}
