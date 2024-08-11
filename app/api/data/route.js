// app/api/data/route.js
import path from "path";
import { promises as fs } from "fs";

export async function GET() {
  try {
    const file1Path = path.join(process.cwd(), "public/data/file1.json");
    const file2Path = path.join(process.cwd(), "public/data/file2.json");
    const file1Data = await fs.readFile(file1Path, "utf8");
    const file2Data = await fs.readFile(file2Path, "utf8");

    return new Response(
      JSON.stringify({
        file1: JSON.parse(file1Data),
        file2: JSON.parse(file2Data),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response("Failed to load data", { status: 500 });
  }
}
