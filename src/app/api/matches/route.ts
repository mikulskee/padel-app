import { getMatchesFromFile } from "@/lib/getMatchesFromFile";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await getMatchesFromFile();

  console.log({ data });
  return NextResponse.json(data);
}
