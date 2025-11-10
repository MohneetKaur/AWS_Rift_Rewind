import { type NextRequest, NextResponse } from "next/server"
import { getMatchData, getTimelineData } from "@/lib/s3-client"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const puuid = searchParams.get("puuid")
  const matchId = searchParams.get("matchId")
  const cluster = searchParams.get("cluster") || "AMERICAS"
  const platform = searchParams.get("platform") || "NA1"
  const includeTimeline = searchParams.get("includeTimeline") === "true"

  if (!puuid || !matchId) {
    return NextResponse.json({ error: "Missing puuid or matchId parameter" }, { status: 400 })
  }

  try {
    // Get match data
    const matchData = await getMatchData(puuid, matchId, cluster, platform)
    
    let timelineData = null
    if (includeTimeline) {
      try {
        timelineData = await getTimelineData(puuid, matchId, cluster, platform)
      } catch (error) {
        console.warn(`Timeline not found for match ${matchId}:`, error)
      }
    }

    return NextResponse.json({
      match: matchData,
      timeline: timelineData
    })
  } catch (error) {
    console.error(`Error fetching match ${matchId} from S3:`, error)
    return NextResponse.json(
      { error: "Match data not found" },
      { status: 404 }
    )
  }
}