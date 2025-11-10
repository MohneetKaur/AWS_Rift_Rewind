import { type NextRequest, NextResponse } from "next/server"
import { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3"
import { gzipSync, gunzipSync } from "zlib"

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(request: NextRequest) {
  try {
    const { puuid, limit } = await request.json()
    
    if (!puuid) {
      return NextResponse.json({ error: "Missing puuid parameter" }, { status: 400 })
    }

    // Set a reasonable default limit to prevent overwhelming processing
    const defaultLimit = 200 // Default to 200 matches for comprehensive analysis
    const effectiveLimit = limit || defaultLimit
    
    console.log(`Generating summary for PUUID: ${puuid} (processing ${effectiveLimit === defaultLimit ? 'default' : 'requested'} ${effectiveLimit} matches)`)

    // Find player's match files in S3
    const playerPrefix = `raw/cluster=ASIA/platform=KR/player=${puuid}/matches/`
    const inputBucket = "rift-rewind-dataset"
    const outputBucket = "rift-rewind-summaries"
    
    console.log(`Searching for matches with prefix: ${playerPrefix}`)
    
    // Get ALL match files using pagination
    let allMatchFiles: string[] = []
    let continuationToken: string | undefined
    
    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: inputBucket,
        Prefix: playerPrefix,
        MaxKeys: 1000, // AWS S3 max per request
        ContinuationToken: continuationToken
      })
      
      const listResponse = await s3Client.send(listCommand)
      
      if (listResponse.Contents) {
        const matchFiles = listResponse.Contents
          .filter(obj => obj.Key?.endsWith('.match.json.gz'))
          .map(obj => obj.Key!)
        
        allMatchFiles.push(...matchFiles)
      }
      
      continuationToken = listResponse.NextContinuationToken
    } while (continuationToken)
    
    console.log(`Found ${allMatchFiles.length} total match files`)
    
    if (allMatchFiles.length === 0) {
      return NextResponse.json({ error: "No match files found for player" }, { status: 404 })
    }
    
    // Apply effective limit
    const matchFilesToProcess = allMatchFiles.slice(0, effectiveLimit)
    
    console.log(`Processing ${matchFilesToProcess.length} matches out of ${allMatchFiles.length} available`)
    
    if (matchFilesToProcess.length === 0) {
      return NextResponse.json({ error: "No match files to process" }, { status: 404 })
    }

    // Process matches to build comprehensive summary and store individual match summaries
    const { playerSummary, matchSummaries, storedMatches } = await processMatches(matchFilesToProcess, inputBucket, outputBucket, puuid)
    
    // Save comprehensive player summary to S3
    const summaryKey = `summaries/players/${puuid}.json`
    const summaryJson = JSON.stringify(playerSummary, null, 2)
    
    const putCommand = new PutObjectCommand({
      Bucket: outputBucket,
      Key: summaryKey,
      Body: summaryJson,
      ContentType: 'application/json'
    })
    
    await s3Client.send(putCommand)
    
    console.log(`Player summary uploaded to s3://${outputBucket}/${summaryKey}`)
    console.log(`Individual match summaries stored: ${storedMatches} matches`)
    
    return NextResponse.json({
      success: true,
      message: 'Comprehensive summaries generated successfully',
      player_summary_location: `s3://${outputBucket}/${summaryKey}`,
      matches_processed: matchFilesToProcess.length,
      total_matches_found: allMatchFiles.length,
      individual_match_summaries_stored: storedMatches,
      summary: playerSummary,
      match_summaries: matchSummaries.slice(0, 5) // Return first 5 for preview
    })

  } catch (error) {
    console.error("Error generating player summary:", error)
    return NextResponse.json(
      { error: "Failed to generate player summary", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

async function processMatches(matchFiles: string[], inputBucket: string, outputBucket: string, targetPuuid: string) {
  console.log(`Processing ${matchFiles.length} matches for comprehensive analysis and individual storage...`)
  
  const summary = {
    puuid: targetPuuid,
    generated_at: new Date().toISOString(),
    total_matches: matchFiles.length,
    
    // Enhanced Performance Metrics
    performance: {
      avg_kda: 0.0,
      win_rate: 0.0,
      avg_kill_participation: 0.0,
      avg_damage_per_minute: 0.0,
      avg_gold_per_minute: 0.0,
      avg_vision_score: 0.0,
      avg_cs_per_minute: 0.0
    },
    
    // Combat Analytics  
    combat_style: {
      avg_damage_to_champions: 0,
      avg_damage_taken: 0,
      damage_type_distribution: {
        physical_percent: 0.0,
        magic_percent: 0.0,
        true_percent: 0.0
      },
      survivability: {
        avg_deaths: 0.0,
        avg_longest_time_alive: 0.0,
        avg_damage_taken_per_death: 0.0
      },
      aggression: {
        avg_multikills: 0.0,
        largest_multikill: 0,
        solo_kills_total: 0,
        kills_under_turret: 0
      }
    },
    
    // Champion & Itemization
    champion_analysis: {
      champion_pool_size: 0,
      most_played_champions: [] as any[],
      champion_diversity: 0.0
    },
    
    itemization: {
      most_common_items: {} as Record<string, number>,
      build_diversity: 0.0,
      summoner_spell_preferences: {} as Record<string, number>
    },
    
    // Game Flow Analysis
    game_flow: {
      avg_game_duration: 0.0,
      preferred_game_modes: {} as Record<string, number>,
      performance_by_game_length: {
        short_games: { count: 0, win_rate: 0.0, avg_kda: 0.0 }, // < 20 min
        medium_games: { count: 0, win_rate: 0.0, avg_kda: 0.0 }, // 20-35 min  
        long_games: { count: 0, win_rate: 0.0, avg_kda: 0.0 }    // > 35 min
      }
    },
    
    // Behavioral Insights
    behavioral_insights: {
      consistency_score: 0.0,
      improvement_trend: 0.0,
      strengths: [] as string[],
      areas_for_improvement: [] as string[]
    },
    
    // Detailed match data for AI context
    recent_matches_detailed: [] as any[],
    
    // Legacy fields for compatibility
    overview: {
      total_kills: 0,
      total_deaths: 0,
      total_assists: 0,
      total_wins: 0,
      total_losses: 0,
      total_damage_dealt: 0,
      total_gold_earned: 0,
      avg_kda: 0.0
    },
    champion_stats: {} as Record<string, any>,
    recent_matches: [] as any[]
  }

  const allMatches = []
  const matchSummaries = []
  const itemUsage: Record<string, number> = {}
  const summonerSpells: Record<string, number> = {}
  let totalGameTime = 0
  let totalPhysicalDamage = 0
  let totalMagicDamage = 0
  let totalTrueDamage = 0
  let totalDamageTaken = 0
  let totalVisionScore = 0
  let totalCS = 0
  let totalKillParticipation = 0
  let multikillsCount = 0
  let largestMultikill = 0
  let processedCount = 0
  let skippedCount = 0
  let storedMatchCount = 0

  for (const matchFile of matchFiles) {
    try {
      // Progress logging for large datasets
      processedCount++
      if (processedCount % 100 === 0) {
        console.log(`Processed ${processedCount}/${matchFiles.length} matches...`)
      }
      
      // Download and decompress match file
      const getCommand = new GetObjectCommand({
        Bucket: inputBucket,
        Key: matchFile
      })
      
      const response = await s3Client.send(getCommand)
      const compressedData = await response.Body?.transformToByteArray()
      
      if (!compressedData) {
        skippedCount++
        continue
      }
      
      // Decompress gzip data
      const decompressedData = gunzipSync(Buffer.from(compressedData))
      const matchData = JSON.parse(decompressedData.toString('utf-8'))
      
      // Find the target player in participants
      const playerData = matchData.info.participants.find((p: any) => p.puuid === targetPuuid)
      
      if (!playerData) {
        skippedCount++
        continue
      }

      // Get team data for kill participation
      const teamData = matchData.info.participants.filter((p: any) => p.teamId === playerData.teamId)
      const teamKills = teamData.reduce((sum: number, p: any) => sum + p.kills, 0)
      const killParticipation = teamKills > 0 ? (playerData.kills + playerData.assists) / teamKills : 0
      
      // Extract comprehensive match info
      const gameDuration = matchData.info.gameDuration
      const matchInfo = {
        game_id: matchData.info.gameId,
        game_creation: matchData.info.gameCreation,
        game_duration: gameDuration,
        game_mode: matchData.info.gameMode,
        game_version: matchData.info.gameVersion,
        champion: {
          name: playerData.championName,
          id: playerData.championId,
          level: playerData.champLevel
        },
        performance: {
          kills: playerData.kills,
          deaths: playerData.deaths,
          assists: playerData.assists,
          kda: calculateKda(playerData.kills, playerData.deaths, playerData.assists),
          win: playerData.win,
          kill_participation: killParticipation
        },
        combat: {
          damage_to_champions: playerData.totalDamageDealtToChampions,
          total_damage_dealt: playerData.totalDamageDealt || 0,
          damage_taken: playerData.totalDamageTaken || 0,
          physical_damage: playerData.physicalDamageDealt || 0,
          magic_damage: playerData.magicDamageDealt || 0,
          true_damage: playerData.trueDamageDealt || 0,
          largest_killing_spree: playerData.largestKillingSpree || 0,
          largest_multikill: playerData.largestMultiKill || 0,
          healing_done: playerData.totalHeal || 0
        },
        economy: {
          gold_earned: playerData.goldEarned,
          cs: (playerData.totalMinionsKilled || 0) + (playerData.neutralMinionsKilled || 0),
          gold_per_minute: playerData.goldEarned / (gameDuration / 60),
          cs_per_minute: ((playerData.totalMinionsKilled || 0) + (playerData.neutralMinionsKilled || 0)) / (gameDuration / 60)
        },
        vision: {
          vision_score: playerData.visionScore || 0,
          wards_placed: playerData.wardsPlaced || 0,
          wards_killed: playerData.wardsKilled || 0
        },
        items: [
          playerData.item0, playerData.item1, playerData.item2, playerData.item3,
          playerData.item4, playerData.item5, playerData.item6
        ].filter(item => item && item !== 0),
        summoner_spells: [playerData.summoner1Id, playerData.summoner2Id],
        challenges: playerData.challenges || {}
      }
      
      allMatches.push(matchInfo)
      
      // Create individual match summary
      const individualMatchSummary = {
        match_id: matchData.info.gameId,
        puuid: targetPuuid,
        generated_at: new Date().toISOString(),
        match_data: matchInfo,
        ai_insights: {
          performance_rating: calculatePerformanceRating(matchInfo),
          key_strengths: identifyMatchStrengths(matchInfo),
          improvement_areas: identifyMatchImprovements(matchInfo),
          notable_events: extractNotableEvents(matchInfo)
        },
        contextual_data: {
          team_composition: extractTeamComposition(matchData, playerData.teamId),
          enemy_composition: extractTeamComposition(matchData, playerData.teamId === 100 ? 200 : 100),
          match_timeline_summary: {
            early_game_performance: calculateEarlyGamePerformance(matchInfo),
            mid_game_performance: calculateMidGamePerformance(matchInfo),
            late_game_performance: calculateLateGamePerformance(matchInfo)
          }
        }
      }
      
      matchSummaries.push(individualMatchSummary)
      
      // Store individual match summary to S3
      try {
        const matchSummaryKey = `summaries/matches/${targetPuuid}/${matchData.info.gameId}.json`
        const matchSummaryJson = JSON.stringify(individualMatchSummary, null, 2)
        
        const putMatchCommand = new PutObjectCommand({
          Bucket: outputBucket,
          Key: matchSummaryKey,
          Body: matchSummaryJson,
          ContentType: 'application/json'
        })
        
        await s3Client.send(putMatchCommand)
        storedMatchCount++
        
        if (storedMatchCount % 50 === 0) {
          console.log(`Stored ${storedMatchCount} individual match summaries...`)
        }
      } catch (storageError) {
        console.error(`Failed to store match summary for ${matchData.info.gameId}:`, storageError)
      }
      
      // Track items usage
      matchInfo.items.forEach(item => {
        itemUsage[item] = (itemUsage[item] || 0) + 1
      })
      
      // Track summoner spells
      const spellCombo = `${playerData.summoner1Id}-${playerData.summoner2Id}`
      summonerSpells[spellCombo] = (summonerSpells[spellCombo] || 0) + 1
      
      // Update champion stats
      const champName = playerData.championName
      if (!summary.champion_stats[champName]) {
        summary.champion_stats[champName] = {
          games_played: 0,
          wins: 0,
          losses: 0,
          total_kills: 0,
          total_deaths: 0,
          total_assists: 0,
          total_damage: 0,
          avg_kda: 0.0,
          avg_kill_participation: 0.0
        }
      }
      
      const champStats = summary.champion_stats[champName]
      champStats.games_played += 1
      champStats.total_kills += playerData.kills
      champStats.total_deaths += playerData.deaths
      champStats.total_assists += playerData.assists
      champStats.total_damage += playerData.totalDamageDealtToChampions
      champStats.avg_kill_participation += killParticipation
      
      if (playerData.win) {
        champStats.wins += 1
        summary.overview.total_wins += 1
      } else {
        champStats.losses += 1
        summary.overview.total_losses += 1
      }
      
      champStats.avg_kda = calculateKda(
        champStats.total_kills,
        champStats.total_deaths,
        champStats.total_assists
      )
      
      // Update aggregate tracking
      totalGameTime += gameDuration
      totalPhysicalDamage += playerData.physicalDamageDealt || 0
      totalMagicDamage += playerData.magicDamageDealt || 0
      totalTrueDamage += playerData.trueDamageDealt || 0
      totalDamageTaken += playerData.totalDamageTaken || 0
      totalVisionScore += playerData.visionScore || 0
      totalCS += (playerData.totalMinionsKilled || 0) + (playerData.neutralMinionsKilled || 0)
      totalKillParticipation += killParticipation
      multikillsCount += (playerData.largestMultiKill || 0) > 1 ? 1 : 0
      largestMultikill = Math.max(largestMultikill, playerData.largestMultiKill || 0)
      
      // Update overview stats (legacy)
      summary.overview.total_kills += playerData.kills
      summary.overview.total_deaths += playerData.deaths
      summary.overview.total_assists += playerData.assists
      summary.overview.total_damage_dealt += playerData.totalDamageDealtToChampions
      summary.overview.total_gold_earned += playerData.goldEarned
      
    } catch (error) {
      skippedCount++
      continue
    }
  }

  console.log(`Match processing complete: ${allMatches.length} successful, ${skippedCount} skipped`)

  // Calculate comprehensive analytics
  if (allMatches.length > 0) {
    const totalMatches = allMatches.length
    
    // Legacy overview calculations
    summary.overview.avg_kda = calculateKda(
      summary.overview.total_kills,
      summary.overview.total_deaths,
      summary.overview.total_assists
    )
    
    // Enhanced Performance Metrics
    summary.performance.avg_kda = summary.overview.avg_kda
    summary.performance.win_rate = (summary.overview.total_wins / totalMatches) * 100
    summary.performance.avg_kill_participation = totalKillParticipation / totalMatches
    summary.performance.avg_damage_per_minute = summary.overview.total_damage_dealt / (totalGameTime / 60)
    summary.performance.avg_gold_per_minute = summary.overview.total_gold_earned / (totalGameTime / 60)
    summary.performance.avg_vision_score = totalVisionScore / totalMatches
    summary.performance.avg_cs_per_minute = totalCS / (totalGameTime / 60)
    
    // Combat Style Analytics
    const totalDamage = totalPhysicalDamage + totalMagicDamage + totalTrueDamage
    summary.combat_style.avg_damage_to_champions = summary.overview.total_damage_dealt / totalMatches
    summary.combat_style.avg_damage_taken = totalDamageTaken / totalMatches
    
    if (totalDamage > 0) {
      summary.combat_style.damage_type_distribution = {
        physical_percent: (totalPhysicalDamage / totalDamage) * 100,
        magic_percent: (totalMagicDamage / totalDamage) * 100,
        true_percent: (totalTrueDamage / totalDamage) * 100
      }
    }
    
    summary.combat_style.survivability = {
      avg_deaths: summary.overview.total_deaths / totalMatches,
      avg_longest_time_alive: 0, // Would need timeline data
      avg_damage_taken_per_death: summary.overview.total_deaths > 0 ? totalDamageTaken / summary.overview.total_deaths : 0
    }
    
    summary.combat_style.aggression = {
      avg_multikills: multikillsCount / totalMatches,
      largest_multikill: largestMultikill,
      solo_kills_total: 0, // Would need challenges data
      kills_under_turret: 0  // Would need challenges data
    }
    
    // Champion Analysis
    summary.champion_analysis.champion_pool_size = Object.keys(summary.champion_stats).length
    summary.champion_analysis.most_played_champions = Object.entries(summary.champion_stats)
      .sort(([,a], [,b]) => b.games_played - a.games_played)
      .slice(0, 5)
      .map(([name, stats]) => ({
        name,
        games: stats.games_played,
        win_rate: stats.games_played > 0 ? (stats.wins / stats.games_played) * 100 : 0,
        avg_kda: stats.avg_kda,
        avg_damage: stats.games_played > 0 ? stats.total_damage / stats.games_played : 0
      }))
    
    // Calculate champion diversity (lower = more focused champion pool)
    const totalGames = Object.values(summary.champion_stats).reduce((sum, stats) => sum + stats.games_played, 0)
    summary.champion_analysis.champion_diversity = totalGames > 0 ? 
      Object.keys(summary.champion_stats).length / totalGames : 0
    
    // Itemization
    summary.itemization.most_common_items = Object.fromEntries(
      Object.entries(itemUsage).sort(([,a], [,b]) => b - a).slice(0, 10)
    )
    summary.itemization.summoner_spell_preferences = Object.fromEntries(
      Object.entries(summonerSpells).sort(([,a], [,b]) => b - a).slice(0, 5)
    )
    summary.itemization.build_diversity = Object.keys(itemUsage).length / totalMatches
    
    // Game Flow Analysis
    summary.game_flow.avg_game_duration = totalGameTime / totalMatches
    
    // Count game modes
    const gameModes = allMatches.reduce((acc, match) => {
      acc[match.game_mode] = (acc[match.game_mode] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    summary.game_flow.preferred_game_modes = gameModes
    
    // Performance by game length
    const shortGames = allMatches.filter(m => m.game_duration < 1200) // < 20 min
    const mediumGames = allMatches.filter(m => m.game_duration >= 1200 && m.game_duration < 2100) // 20-35 min
    const longGames = allMatches.filter(m => m.game_duration >= 2100) // > 35 min
    
    summary.game_flow.performance_by_game_length = {
      short_games: {
        count: shortGames.length,
        win_rate: shortGames.length > 0 ? (shortGames.filter(m => m.performance.win).length / shortGames.length) * 100 : 0,
        avg_kda: shortGames.length > 0 ? shortGames.reduce((sum, m) => sum + m.performance.kda, 0) / shortGames.length : 0
      },
      medium_games: {
        count: mediumGames.length,
        win_rate: mediumGames.length > 0 ? (mediumGames.filter(m => m.performance.win).length / mediumGames.length) * 100 : 0,
        avg_kda: mediumGames.length > 0 ? mediumGames.reduce((sum, m) => sum + m.performance.kda, 0) / mediumGames.length : 0
      },
      long_games: {
        count: longGames.length,
        win_rate: longGames.length > 0 ? (longGames.filter(m => m.performance.win).length / longGames.length) * 100 : 0,
        avg_kda: longGames.length > 0 ? longGames.reduce((sum, m) => sum + m.performance.kda, 0) / longGames.length : 0
      }
    }
    
    // Behavioral Insights
    const kdaValues = allMatches.map(m => m.performance.kda)
    const avgKda = kdaValues.reduce((sum, kda) => sum + kda, 0) / kdaValues.length
    const kdaVariance = kdaValues.reduce((sum, kda) => sum + Math.pow(kda - avgKda, 2), 0) / kdaValues.length
    summary.behavioral_insights.consistency_score = Math.max(0, 1 - (kdaVariance / (avgKda + 1))) * 100
    
    // Calculate improvement trend (last 40% vs first 40% of matches)
    const sortedByTime = [...allMatches].sort((a, b) => a.game_creation - b.game_creation)
    const sampleSize = Math.floor(totalMatches * 0.4)
    if (sampleSize > 0) {
      const earlyMatches = sortedByTime.slice(0, sampleSize)
      const recentMatches = sortedByTime.slice(-sampleSize)
      
      const earlyAvgKda = earlyMatches.reduce((sum, m) => sum + m.performance.kda, 0) / earlyMatches.length
      const recentAvgKda = recentMatches.reduce((sum, m) => sum + m.performance.kda, 0) / recentMatches.length
      
      summary.behavioral_insights.improvement_trend = ((recentAvgKda - earlyAvgKda) / earlyAvgKda) * 100
    }
    
    // Generate insights
    summary.behavioral_insights.strengths = []
    summary.behavioral_insights.areas_for_improvement = []
    
    if (summary.performance.avg_kill_participation > 0.6) {
      summary.behavioral_insights.strengths.push("High team fight participation")
    }
    if (summary.performance.win_rate > 55) {
      summary.behavioral_insights.strengths.push("Strong win rate")
    }
    if (summary.champion_analysis.champion_diversity < 0.3) {
      summary.behavioral_insights.strengths.push("Focused champion pool mastery")
    }
    if (summary.combat_style.survivability.avg_deaths < 6) {
      summary.behavioral_insights.strengths.push("Good survivability")
    }
    
    if (summary.performance.avg_vision_score < 10) {
      summary.behavioral_insights.areas_for_improvement.push("Vision control")
    }
    if (summary.performance.avg_cs_per_minute < 5) {
      summary.behavioral_insights.areas_for_improvement.push("Farm efficiency")
    }
    if (summary.performance.win_rate < 45) {
      summary.behavioral_insights.areas_for_improvement.push("Overall game impact")
    }
    
    // Sort matches by game creation time (most recent first)
    allMatches.sort((a, b) => b.game_creation - a.game_creation)
    summary.recent_matches_detailed = allMatches.slice(0, 5)
    summary.recent_matches = allMatches.slice(0, 5).map(match => ({
      game_id: match.game_id,
      game_creation: match.game_creation,
      game_duration: match.game_duration,
      game_mode: match.game_mode,
      champion_name: match.champion.name,
      kills: match.performance.kills,
      deaths: match.performance.deaths,
      assists: match.performance.assists,
      damage_dealt: match.combat.damage_to_champions,
      gold_earned: match.economy.gold_earned,
      win: match.performance.win
    }))
  }

  console.log(`Individual match summaries storage complete: ${storedMatchCount} matches stored`)
  
  return {
    playerSummary: summary,
    matchSummaries: matchSummaries,
    storedMatches: storedMatchCount
  }
}

function calculateKda(kills: number, deaths: number, assists: number): number {
  if (deaths === 0) {
    return kills + assists
  }
  return (kills + assists) / deaths
}

// Helper functions for individual match analysis
function calculatePerformanceRating(matchInfo: any): string {
  const kda = matchInfo.performance.kda
  const killParticipation = matchInfo.performance.kill_participation
  const win = matchInfo.performance.win
  
  let score = 0
  
  // KDA scoring (0-40 points)
  if (kda >= 3) score += 40
  else if (kda >= 2) score += 30
  else if (kda >= 1.5) score += 20
  else if (kda >= 1) score += 10
  
  // Kill participation scoring (0-30 points)
  if (killParticipation >= 0.7) score += 30
  else if (killParticipation >= 0.5) score += 20
  else if (killParticipation >= 0.3) score += 10
  
  // Win bonus (0-30 points)
  if (win) score += 30
  
  if (score >= 80) return "Excellent"
  if (score >= 60) return "Good"
  if (score >= 40) return "Average"
  if (score >= 20) return "Below Average"
  return "Poor"
}

function identifyMatchStrengths(matchInfo: any): string[] {
  const strengths: string[] = []
  
  if (matchInfo.performance.kda >= 2.5) {
    strengths.push("High KDA performance")
  }
  
  if (matchInfo.performance.kill_participation >= 0.6) {
    strengths.push("Strong team fight presence")
  }
  
  if (matchInfo.economy.cs_per_minute >= 6) {
    strengths.push("Excellent farming")
  }
  
  if (matchInfo.vision.vision_score >= 15) {
    strengths.push("Good vision control")
  }
  
  if (matchInfo.combat.damage_to_champions >= 20000) {
    strengths.push("High damage output")
  }
  
  if (matchInfo.performance.deaths <= 3) {
    strengths.push("Excellent survivability")
  }
  
  return strengths.length > 0 ? strengths : ["Consistent gameplay"]
}

function identifyMatchImprovements(matchInfo: any): string[] {
  const improvements: string[] = []
  
  if (matchInfo.performance.deaths >= 8) {
    improvements.push("Reduce deaths and improve positioning")
  }
  
  if (matchInfo.economy.cs_per_minute < 4) {
    improvements.push("Focus on farming and gold efficiency")
  }
  
  if (matchInfo.vision.vision_score < 8) {
    improvements.push("Improve vision control and map awareness")
  }
  
  if (matchInfo.performance.kill_participation < 0.4) {
    improvements.push("Increase team fight participation")
  }
  
  if (matchInfo.combat.damage_to_champions < 10000) {
    improvements.push("Focus on dealing more damage to champions")
  }
  
  return improvements.length > 0 ? improvements : ["Continue current performance level"]
}

function extractNotableEvents(matchInfo: any): string[] {
  const events: string[] = []
  
  if (matchInfo.combat.largest_multikill >= 3) {
    events.push(`Achieved ${matchInfo.combat.largest_multikill}-kill multikill`)
  }
  
  if (matchInfo.combat.largest_killing_spree >= 5) {
    events.push(`${matchInfo.combat.largest_killing_spree}-kill killing spree`)
  }
  
  if (matchInfo.performance.kills >= 15) {
    events.push("High kill game (15+ kills)")
  }
  
  if (matchInfo.economy.gold_earned >= 15000) {
    events.push("High gold accumulation")
  }
  
  if (matchInfo.game_duration < 1200 && matchInfo.performance.win) {
    events.push("Fast victory (under 20 minutes)")
  }
  
  return events
}

function extractTeamComposition(matchData: any, teamId: number): any {
  const teamPlayers = matchData.info.participants.filter((p: any) => p.teamId === teamId)
  
  return {
    champions: teamPlayers.map((p: any) => ({
      champion: p.championName,
      role: p.individualPosition || "UNKNOWN",
      summoner_name: p.summonerName || "Unknown"
    })),
    team_stats: {
      total_kills: teamPlayers.reduce((sum: number, p: any) => sum + p.kills, 0),
      total_deaths: teamPlayers.reduce((sum: number, p: any) => sum + p.deaths, 0),
      total_assists: teamPlayers.reduce((sum: number, p: any) => sum + p.assists, 0),
      total_damage: teamPlayers.reduce((sum: number, p: any) => sum + p.totalDamageDealtToChampions, 0),
      total_gold: teamPlayers.reduce((sum: number, p: any) => sum + p.goldEarned, 0)
    }
  }
}

function calculateEarlyGamePerformance(matchInfo: any): string {
  // Early game is typically first 15 minutes
  // Since we don't have timeline data, we'll estimate based on overall performance
  const kda = matchInfo.performance.kda
  const csPerMin = matchInfo.economy.cs_per_minute
  
  if (kda >= 2 && csPerMin >= 5) return "Strong"
  if (kda >= 1.5 && csPerMin >= 4) return "Good"
  if (kda >= 1 && csPerMin >= 3) return "Average"
  return "Weak"
}

function calculateMidGamePerformance(matchInfo: any): string {
  // Mid game focuses on team fights and objectives
  const killParticipation = matchInfo.performance.kill_participation
  const damage = matchInfo.combat.damage_to_champions
  
  if (killParticipation >= 0.7 && damage >= 15000) return "Strong"
  if (killParticipation >= 0.5 && damage >= 10000) return "Good" 
  if (killParticipation >= 0.3 && damage >= 5000) return "Average"
  return "Weak"
}

function calculateLateGamePerformance(matchInfo: any): string {
  // Late game focuses on decision making and team coordination
  const win = matchInfo.performance.win
  const deaths = matchInfo.performance.deaths
  const damage = matchInfo.combat.damage_to_champions
  
  if (win && deaths <= 5 && damage >= 20000) return "Strong"
  if (win && deaths <= 7) return "Good"
  if (deaths <= 8) return "Average" 
  return "Weak"
}