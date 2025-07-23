"use server";
import { promises as fs } from "fs";
import path from "path";
import { MatchData } from "@/types/match";

export const getPlayersFromFile = async (): Promise<MatchData> => {
  const filePath = path.join(process.cwd(), "src/data/matches.json");
  const file = await fs.readFile(filePath, "utf-8");
  return JSON.parse(file);
};
