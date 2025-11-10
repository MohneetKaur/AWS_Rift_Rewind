import { type NextRequest, NextResponse } from "next/server"

const RIOT_API_KEY = process.env.RIOT_API_KEY || ""

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const puuid = searchParams.get("puuid")
  const region = searchParams.get("region") || "na1"

  if (!puuid) {
    return NextResponse.json({ error: "Missing puuid" }, { status: 400 })
  }

  try {
    // GET /lol/summoner/v4/summoners/by-puuid/{encryptedPUUID}
    const response = await fetch(`https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`, {
      headers: {
        "X-Riot-Token": RIOT_API_KEY,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Summoner not found" }, { status: 404 })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Riot API error:", error)
    return NextResponse.json({ error: "Failed to fetch summoner" }, { status: 500 })
  }
}
