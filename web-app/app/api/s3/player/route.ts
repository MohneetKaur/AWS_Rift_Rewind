import { type NextRequest, NextResponse } from "next/server"
import { getPlayerData, getMatchIds, getMatchData } from "@/lib/s3-client"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const puuid = searchParams.get("puuid")
  const cluster = searchParams.get("cluster") || "AMERICAS"
  const platform = searchParams.get("platform") || "NA1"
  const includeMatches = searchParams.get("includeMatches") === "true"
  const matchCount = parseInt(searchParams.get("matchCount") || "20")

  if (!puuid) {
    return NextResponse.json({ error: "Missing puuid parameter" }, { status: 400 })
  }

  try {
    // Get basic player data
    const playerData = await getPlayerData(puuid, cluster, platform)
    
    let matches = []
    if (includeMatches) {
      // Get match IDs
      const matchIds = await getMatchIds(puuid, cluster, platform)
      const limitedMatchIds = matchIds.slice(0, matchCount)
      
      // Fetch match details
      const matchPromises = limitedMatchIds.map(matchId => 
        getMatchData(puuid, matchId, cluster, platform).catch(error => {
          console.warn(`Failed to fetch match ${matchId}:`, error.message)
          return null
        })
      )
      
      const matchResults = await Promise.allSettled(matchPromises)
      matches = matchResults
        .filter(result => result.status === 'fulfilled' && result.value !== null)
        .map(result => (result as PromiseFulfilledResult<any>).value)
    }

    // Process and format the response
    const response = {
      puuid,
      account: playerData.account,
      profile: playerData.profile,
      ranked: playerData.ranked.entries || [],
      manifest: playerData.manifest,
      matches,
      stats: matches.length > 0 ? processPlayerStats(matches, puuid) : null
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching player data from S3:", error)
    return NextResponse.json(
      { error: "Player data not found or failed to fetch from S3" },
      { status: 404 }
    )
  }
}

// Helper function to process match data into statistics
function processPlayerStats(matches: any[], puuid: string) {
  if (!matches.length) return null
  
  const stats = {
    totalGames: matches.length,
    wins: 0,
    losses: 0,
    kills: 0,
    deaths: 0,
    assists: 0,
    cs: 0,
    visionScore: 0,
    damageDealt: 0,
    goldEarned: 0,
    gameDuration: 0,
    champions: {} as Record<string, { games: number; wins: number; kills: number; deaths: number; assists: number }>,
    patches: {} as Record<string, number>,
    roles: {} as Record<string, number>
  }

  matches.forEach((match) => {
    if (!match.info || !match.info.participants) return
    
    const participant = match.info.participants.find((p: any) => p.puuid === puuid)
    if (!participant) return

    // Basic stats
    if (participant.win) stats.wins++
    else stats.losses++

    stats.kills += participant.kills
    stats.deaths += participant.deaths
    stats.assists += participant.assists
    stats.cs += (participant.totalMinionsKilled || 0) + (participant.neutralMinionsKilled || 0)
    stats.visionScore += participant.visionScore || 0
    stats.damageDealt += participant.totalDamageDealtToChampions || 0
    stats.goldEarned += participant.goldEarned || 0
    stats.gameDuration += match.info.gameDuration || 0

    // Champion stats
    const championName = participant.championName
    if (!stats.champions[championName]) {
      stats.champions[championName] = { games: 0, wins: 0, kills: 0, deaths: 0, assists: 0 }
    }
    stats.champions[championName].games++
    if (participant.win) stats.champions[championName].wins++
    stats.champions[championName].kills += participant.kills
    stats.champions[championName].deaths += participant.deaths
    stats.champions[championName].assists += participant.assists

    // Patch tracking
    const gameVersion = match.info.gameVersion
    if (gameVersion) {
      const patch = gameVersion.split('.').slice(0, 2).join('.')
      stats.patches[patch] = (stats.patches[patch] || 0) + 1
    }

    // Role tracking
    const role = participant.teamPosition || participant.individualPosition || 'UNKNOWN'
    stats.roles[role] = (stats.roles[role] || 0) + 1
  })

  // Calculate derived stats
  const totalGameTime = stats.gameDuration
  const avgGameTime = totalGameTime / stats.totalGames

  return {
    ...stats,
    winRate: Math.round((stats.wins / stats.totalGames) * 100),
    kda: stats.deaths === 0 ? stats.kills + stats.assists : Number(((stats.kills + stats.assists) / stats.deaths).toFixed(2)),
    avgKills: Number((stats.kills / stats.totalGames).toFixed(1)),
    avgDeaths: Number((stats.deaths / stats.totalGames).toFixed(1)),
    avgAssists: Number((stats.assists / stats.totalGames).toFixed(1)),
    csPerMin: Number((stats.cs / (totalGameTime / 60)).toFixed(1)),
    avgVisionScore: Number((stats.visionScore / stats.totalGames).toFixed(1)),
    goldPerMin: Number((stats.goldEarned / (totalGameTime / 60)).toFixed(0)),
    avgGameDuration: Math.round(avgGameTime),
    topChampions: Object.entries(stats.champions)
      .map(([champion, data]) => ({
        champion,
        ...data,
        winRate: Math.round((data.wins / data.games) * 100),
        kda: data.deaths === 0 ? data.kills + data.assists : Number(((data.kills + data.assists) / data.deaths).toFixed(2))
      }))
      .sort((a, b) => b.games - a.games)
      .slice(0, 10),
    patchDistribution: stats.patches,
    roleDistribution: stats.roles
  }
}