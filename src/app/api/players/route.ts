import { getPlayersFromFile } from "@/lib/getPlayersFromFile";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await getPlayersFromFile();

  return NextResponse.json(data);
}
