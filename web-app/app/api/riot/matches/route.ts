import { type NextRequest, NextResponse } from "next/server"

const RIOT_API_KEY = process.env.RIOT_API_KEY || ""

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const puuid = searchParams.get("puuid")
  const region = searchParams.get("region") || "americas"
  const count = searchParams.get("count") || "20"

  if (!puuid) {
    return NextResponse.json({ error: "Missing puuid" }, { status: 400 })
  }

  try {
    // GET /lol/match/v5/matches/by-puuid/{puuid}/ids
    const matchIdsResponse = await fetch(
      `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`,
      {
        headers: {
          "X-Riot-Token": RIOT_API_KEY,
        },
      },
    )

    if (!matchIdsResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch match IDs" }, { status: 404 })
    }

    const matchIds = await matchIdsResponse.json()

    // Fetch match details for each ID
    const matchPromises = matchIds.map((matchId: string) =>
      fetch(`https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}`, {
        headers: {
          "X-Riot-Token": RIOT_API_KEY,
        },
      }).then((res) => res.json()),
    )

    const matches = await Promise.all(matchPromises)
    return NextResponse.json(matches)
  } catch (error) {
    console.error("[v0] Riot API error:", error)
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 })
  }
}
