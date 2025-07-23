import { MatchData } from "@/types/match";

export const getPreviousMatchesFromGitHub =
  async (): Promise<MatchData | null> => {
    const owner = "mikulskee";
    const repo = "padel-app";
    const filePath = "src/data/matches.json";

    // Krok 1: pobierz ostatni commit dla pliku
    const commitsRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?path=${filePath}&per_page=1`
    );

    if (!commitsRes.ok) return null;

    const commitsData = await commitsRes.json();
    const parentSha = commitsData?.[0]?.parents?.[0]?.sha;

    if (!parentSha) return null;

    // Krok 2: pobierz zawartość pliku z poprzedniego commita
    const fileRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${parentSha}`
    );

    if (!fileRes.ok) return null;

    const fileData = await fileRes.json();

    if (!fileData?.content) return null;

    const decodedContent = Buffer.from(fileData.content, "base64").toString(
      "utf-8"
    );
    const parsed = JSON.parse(decodedContent);

    return parsed;
  };
