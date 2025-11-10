import { type NextRequest, NextResponse } from "next/server"

// Riot API endpoints
const RIOT_API_KEY = process.env.RIOT_API_KEY || ""

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const gameName = searchParams.get("gameName")
  const tagLine = searchParams.get("tagLine")
  const region = searchParams.get("region") || "americas"

  if (!gameName || !tagLine) {
    return NextResponse.json({ error: "Missing gameName or tagLine" }, { status: 400 })
  }

  try {
    // In production, this would call the actual Riot API
    // GET /riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}
    const response = await fetch(
      `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
      {
        headers: {
          "X-Riot-Token": RIOT_API_KEY,
        },
      },
    )

    if (!response.ok) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Riot API error:", error)
    return NextResponse.json({ error: "Failed to fetch account" }, { status: 500 })
  }
}
