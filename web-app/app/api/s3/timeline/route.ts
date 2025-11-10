import { type NextRequest, NextResponse } from "next/server"
import { getTimelineData } from "@/lib/s3-client"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const puuid = searchParams.get("puuid")
  const matchId = searchParams.get("matchId")
  const cluster = searchParams.get("cluster") || "AMERICAS"
  const platform = searchParams.get("platform") || "NA1"

  if (!puuid || !matchId) {
    return NextResponse.json({ error: "Missing puuid or matchId parameter" }, { status: 400 })
  }

  // Temporarily disable timeline endpoint to reduce console noise
  // Most timelines are missing anyway, causing excessive 404 logging
  return NextResponse.json({
    matchId,
    goldDifference: [], // Empty data for now
    raw: { info: { note: "Timeline data temporarily disabled to reduce console noise" } }
  })

  /*
  try {
    const timeline = await getTimelineData(puuid, matchId, cluster, platform)
    
    // Process timeline data to calculate gold difference over time
    const goldDifferenceData = processTimelineForGoldDifference(timeline, puuid)
    
    return NextResponse.json({
      matchId,
      goldDifference: goldDifferenceData,
      raw: timeline
    })
  } catch (error) {
    console.error("Error fetching timeline data:", error)
    return NextResponse.json(
      { error: "Timeline data not found or failed to fetch from S3" },
      { status: 404 }
    )
  }
  */
}

function processTimelineForGoldDifference(timeline: any, puuid: string) {
  if (!timeline?.info?.frames || !timeline?.info?.participants) {
    return []
  }

  // Find which participant is our player and which team they're on
  const participant = timeline.info.participants.find((p: any) => p.puuid === puuid)
  if (!participant) {
    return []
  }

  const playerTeam = participant.teamId
  const playerParticipantId = participant.participantId

  const goldDifferenceOverTime: { time: number; goldDiff: number }[] = []

  timeline.info.frames.forEach((frame: any, index: number) => {
    if (!frame.participantFrames) return

    const timestamp = frame.timestamp
    const timeMinutes = Math.round(timestamp / (1000 * 60)) // Convert to minutes

    let teamGold = 0
    let enemyGold = 0

    // Calculate total gold for each team
    Object.values(frame.participantFrames).forEach((participantFrame: any) => {
      const participantId = participantFrame.participantId
      const totalGold = participantFrame.totalGold || 0

      // Find which team this participant belongs to
      const frameParticipant = timeline.info.participants.find((p: any) => p.participantId === participantId)
      if (frameParticipant) {
        if (frameParticipant.teamId === playerTeam) {
          teamGold += totalGold
        } else {
          enemyGold += totalGold
        }
      }
    })

    const goldDifference = teamGold - enemyGold

    goldDifferenceOverTime.push({
      time: timeMinutes,
      goldDiff: goldDifference
    })
  })

  return goldDifferenceOverTime
}