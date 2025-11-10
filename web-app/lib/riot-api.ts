// Utility functions for Riot API integration (legacy - direct API calls)
export async function fetchAccountByRiotId(gameName: string, tagLine: string, region = "americas") {
  const response = await fetch(`/api/riot/account?gameName=${gameName}&tagLine=${tagLine}&region=${region}`)
  if (!response.ok) throw new Error("Account not found")
  return response.json()
}

export async function fetchSummonerByPuuid(puuid: string, region = "na1") {
  const response = await fetch(`/api/riot/summoner?puuid=${puuid}&region=${region}`)
  if (!response.ok) throw new Error("Summoner not found")
  return response.json()
}

export async function fetchMatchHistory(puuid: string, region = "americas", count = 20) {
  const response = await fetch(`/api/riot/matches?puuid=${puuid}&region=${region}&count=${count}`)
  if (!response.ok) throw new Error("Failed to fetch matches")
  return response.json()
}

// New S3-based data fetching functions
export async function fetchPlayerDataFromS3(puuid: string, cluster = "AMERICAS", platform = "NA1", includeMatches = true, matchCount = 20) {
  const params = new URLSearchParams({
    puuid,
    cluster,
    platform,
    includeMatches: includeMatches.toString(),
    matchCount: matchCount.toString()
  })
  
  const response = await fetch(`/api/s3/player?${params}`)
  if (!response.ok) throw new Error("Player data not found in S3")
  return response.json()
}

export async function fetchMatchFromS3(puuid: string, matchId: string, cluster = "AMERICAS", platform = "NA1", includeTimeline = false) {
  const params = new URLSearchParams({
    puuid,
    matchId,
    cluster,
    platform,
    includeTimeline: includeTimeline.toString()
  })
  
  const response = await fetch(`/api/s3/match?${params}`)
  if (!response.ok) throw new Error("Match data not found in S3")
  return response.json()
}

export async function fetchStaticDataFromS3(dataType: "champion" | "item" | "runes" | "summoner_spells") {
  const response = await fetch(`/api/s3/static?type=${dataType}`)
  if (!response.ok) throw new Error(`Failed to fetch ${dataType} data from S3`)
  return response.json()
}

export async function generateAIInsights(stats: any, category: "macro" | "micro" | "draft") {
  const response = await fetch("/api/ai/insights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stats, category }),
  })
  if (!response.ok) throw new Error("Failed to generate insights")
  return response.json()
}

export async function generateRoast(stats: any, rating: "pg" | "pg13") {
  const response = await fetch("/api/ai/roast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stats, rating }),
  })
  if (!response.ok) throw new Error("Failed to generate roast")
  return response.json()
}

// Process raw match data into stats
export function processMatchData(matches: any[], puuid: string) {
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
  }

  matches.forEach((match) => {
    const participant = match.info.participants.find((p: any) => p.puuid === puuid)
    if (!participant) return

    if (participant.win) stats.wins++
    else stats.losses++

    stats.kills += participant.kills
    stats.deaths += participant.deaths
    stats.assists += participant.assists
    stats.cs += participant.totalMinionsKilled + participant.neutralMinionsKilled
    stats.visionScore += participant.visionScore
    stats.damageDealt += participant.totalDamageDealtToChampions
    stats.goldEarned += participant.goldEarned
    stats.gameDuration += match.info.gameDuration
  })

  return {
    ...stats,
    winRate: (stats.wins / stats.totalGames) * 100,
    kda: stats.deaths === 0 ? stats.kills + stats.assists : (stats.kills + stats.assists) / stats.deaths,
    avgKills: stats.kills / stats.totalGames,
    avgDeaths: stats.deaths / stats.totalGames,
    avgAssists: stats.assists / stats.totalGames,
    csPerMin: stats.cs / (stats.gameDuration / 60),
    avgVisionScore: stats.visionScore / stats.totalGames,
    goldPerMin: stats.goldEarned / (stats.gameDuration / 60),
  }
}
