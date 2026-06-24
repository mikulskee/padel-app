import { Match } from "@/types/match";

export const getMatchYear = (match: Match): number => Number(match.date.slice(0, 4));

export const getCurrentYear = (): number => new Date().getFullYear();

export const filterMatchesByYear = (matches: Match[], year: number): Match[] =>
	matches.filter((match) => getMatchYear(match) === year);

export const getAvailableYears = (matches: Match[]): number[] =>
	Array.from(new Set(matches.map(getMatchYear))).sort((a, b) => b - a);
