"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Sparkles, Share2 } from "lucide-react"
import Link from "next/link"
import { ProfileBadge } from "@/components/profile-badge"
import { KpiStrip } from "@/components/kpi-strip"
import { MatchList } from "@/components/match-list"
import { ChampionHeatmap } from "@/components/champion-heatmap"
import { PatchAwareLine } from "@/components/patch-aware-line"
import { ObjectiveDonut } from "@/components/objective-donut"
import { AIInsights } from "@/components/ai-insights"
import { RoastSection } from "@/components/roast-section"
import { HiddenGems } from "@/components/hidden-gems"
import { ShareCardComposer } from "@/components/share-card-composer"
import { RoleDistribution } from "@/components/role-distribution"
import { ObjectiveControlBar } from "@/components/objective-control-bar"
import { PerformanceHistogram } from "@/components/performance-histogram"
import { ComebackTempo } from "@/components/comeback-tempo"
import { RankProgression } from "@/components/rank-progression"
import { ChampionPerformanceBar } from "@/components/champion-performance-bar"
import { samplePlayerData, sampleMatches } from "@/lib/sample-data"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { fetchPlayerDataFromS3, fetchAccountByRiotId, fetchSummonerByPuuid, fetchMatchHistory, processMatchData } from "@/lib/riot-api"

interface PlayerData {
  summonerName: string
  tagline: string
  level: number
  profileIcon: number
  tier: string
  rank: string
  leaguePoints: number
  wins: number
  losses: number
}

interface S3PlayerResponse {
  puuid: string
  account: any
  profile?: any
  ranked: any[]
  manifest: any
  matches: any[]
  stats: any
}

function mapS3PlayerData(s3Data: S3PlayerResponse): PlayerData {
  const account = s3Data.account
  const profile = s3Data.profile
  const rankedData = s3Data.ranked.find((r: any) => r.queueType === "RANKED_SOLO_5x5") || {}
  
  // Use stats data for wins/losses if available, otherwise fall back to ranked data
  const stats = s3Data.stats
  const wins = stats?.wins || rankedData.wins || 0
  const losses = stats?.losses || rankedData.losses || 0
  
  return {
    summonerName: account.gameName || "Unknown",
    tagline: account.tagLine || "TAG",
    level: profile?.summonerLevel || 1,
    profileIcon: profile?.profileIconId || 0,
    tier: rankedData.tier || "UNRANKED",
    rank: rankedData.rank || "",
    leaguePoints: rankedData.leaguePoints || 0,
    wins,
    losses,
  }
}

function mapSamplePlayerData(data: typeof samplePlayerData & { wins?: number; losses?: number }) {
  const wins = typeof data.wins === "number" ? data.wins : 82
  const losses = typeof data.losses === "number" ? data.losses : 74
  return {
    summonerName: data.gameName || "DemoSummoner",
    tagline: data.tagLine || "NA1",
    level: data.summonerLevel || 1,
    profileIcon: data.profileIconId || 0,
    tier: data.tier || "-",
    rank: data.rank || "-",
    leaguePoints: data.leaguePoints || 0,
    wins,
    losses,
  }
}

const defaultPlayerData = mapSamplePlayerData(samplePlayerData)

  // Temporary placeholder - will be generated after state is defined
  const aiInsights = [
    {
      type: "macro" as const,
      title: "Focus on Objective Priority",
      description: "Improving objective control could boost your win rate. Prioritize dragon setups and herald plays for map pressure.",
      evidence: "Win rate opportunity"
    },
    {
      type: "micro" as const,
      title: "Mechanical Consistency", 
      description: "Focus on reducing deaths while maintaining kill participation. Better positioning in team fights could improve your impact.",
      evidence: "KDA improvement target"
    },
    {
      type: "draft" as const,
      title: "Champion Pool Expansion",
      description: "Developing deeper mastery on 2-3 champions could improve consistency. Focus on meta picks that fit your playstyle.",
      evidence: "Champion mastery opportunity"
    }
  ]

  // Default roast data - will be generated after state is defined
  const roastData = {
    roast: "Still analyzing your gameplay... but from what I can see, there's definitely room for improvement. Keep playing and the roasts will get more specific!",
    challenge: "Play 5 more games to unlock personalized roasts based on your performance patterns."
  }

export default function PlayerDashboard() {
  const params = useParams()
  const puuid = params?.puuid as string | undefined
  const [playerData, setPlayerData] = useState(defaultPlayerData)
  const [s3PlayerData, setS3PlayerData] = useState<S3PlayerResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Prevent hydration mismatch by ensuring client-only rendering of dynamic content
  useEffect(() => {
    setHydrated(true)
  }, [])

  // Fetch player data from S3 when component mounts
  useEffect(() => {
    if (!puuid) {
      setLoading(false)
      return
    }

    // Try to fetch from live Riot API first
    const fetchFromRiotAPI = async (puuid: string) => {
      try {
        console.log("Attempting to fetch from live Riot API for puuid:", puuid)
        
        // Determine region based on PUUID or try multiple regions
        const regions = ["asia", "americas", "europe", "sea"]
        const platforms = [
          { region: "asia", platform: "kr" },
          { region: "americas", platform: "na1" },
          { region: "europe", platform: "euw1" },
          { region: "sea", platform: "sg2" }
        ]
        
        let summonerData = null
        let matchHistory = null
        let usedPlatform = null
        
        // Try each platform until we find the player
        for (const { region, platform } of platforms) {
          try {
            console.log(`Trying ${region}/${platform}...`)
            summonerData = await fetchSummonerByPuuid(puuid, platform)
            matchHistory = await fetchMatchHistory(puuid, region, 50)
            usedPlatform = { region, platform }
            console.log(`Found player data on ${region}/${platform}`)
            break
          } catch (err) {
            console.log(`Player not found on ${region}/${platform}`)
            continue
          }
        }
        
        if (!summonerData) {
          throw new Error("Player not found in any region")
        }
        
        // Handle empty match history gracefully
        if (!matchHistory || !Array.isArray(matchHistory) || matchHistory.length === 0) {
          console.log("No match history found, but player exists. Using profile data only.")
          matchHistory = []
        }
        
        // Process the live data into our format
        const processedStats = processMatchData(matchHistory, puuid)
        
        const livePlayerData = {
          summonerName: summonerData.name || "Unknown Player",
          tagline: "TAG", // We don't have tagline from summoner API  
          level: summonerData.summonerLevel || 1,
          profileIcon: summonerData.profileIconId || 0,
          tier: summonerData.tier || "UNRANKED",
          rank: summonerData.rank || "",
          leaguePoints: summonerData.leaguePoints || 0,
          wins: processedStats.wins || 0,
          losses: processedStats.losses || 0,
        }
        
        // Create S3-like data structure for compatibility
        const liveS3Data = {
          puuid,
          account: { gameName: livePlayerData.summonerName, tagLine: livePlayerData.tagline },
          profile: { summonerLevel: livePlayerData.level, profileIconId: livePlayerData.profileIcon },
          ranked: [{
            queueType: "RANKED_SOLO_5x5",
            tier: livePlayerData.tier,
            rank: livePlayerData.rank,
            leaguePoints: livePlayerData.leaguePoints,
            wins: livePlayerData.wins,
            losses: livePlayerData.losses
          }],
          matches: matchHistory,
          stats: processedStats,
          manifest: { 
            source: "live-api", 
            platform: usedPlatform?.platform || "unknown",
            region: usedPlatform?.region || "unknown"
          }
        }
        
        return { playerData: livePlayerData, s3Data: liveS3Data }
      } catch (err) {
        console.error("Live Riot API fetch failed:", err)
        throw err
      }
    }

    const fetchPlayerData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log("Fetching player data for puuid:", puuid)
        
        // Step 1: Try S3 data first (prioritize comprehensive historical data)
        try {
          // Try different region/platform combinations for S3
          const s3Attempts = [
            { cluster: "ASIA", platform: "KR" },
            { cluster: "AMERICAS", platform: "NA1" },
            { cluster: "EUROPE", platform: "EUW1" }
          ]
          
          let s3Data = null
          for (const { cluster, platform } of s3Attempts) {
            try {
              s3Data = await fetchPlayerDataFromS3(puuid, cluster, platform, true, 917)
              console.log(`S3 data found in ${cluster}/${platform}:`, s3Data)
              break
            } catch (s3Err) {
              console.log(`No S3 data in ${cluster}/${platform}`)
              continue
            }
          }
          
          if (s3Data) {
            setS3PlayerData(s3Data)
            setPlayerData(mapS3PlayerData(s3Data))
            console.log("Player data from S3 mapped successfully")
            return
          }
        } catch (s3Error) {
          console.error("S3 data fetch failed:", s3Error)
        }
        
        // Step 2: Fallback to live API if S3 fails
        try {
          const liveData = await fetchFromRiotAPI(puuid)
          console.log("Falling back to live API data:", liveData)
          
          // Check if live data has meaningful content
          const hasLiveMatchData = liveData.s3Data.matches && liveData.s3Data.matches.length > 0
          const hasLiveRankedData = liveData.playerData.wins > 0 || liveData.playerData.losses > 0
          
          if (hasLiveMatchData || hasLiveRankedData) {
            setS3PlayerData(liveData.s3Data)
            setPlayerData(liveData.playerData)
            console.log("Player data from live API fallback mapped successfully")
            return
          }
        } catch (liveError) {
          console.log("Live API fallback also failed:", liveError)
        }
        
        // Step 3: Final fallback to sample data
        console.log("Both S3 and live API failed, using sample data")
        setError("Player data not available - showing sample data")
        setPlayerData(defaultPlayerData)
      } catch (err) {
        console.error("Failed to fetch player data:", err)
        setError(`Failed to load player data: ${err instanceof Error ? err.message : 'Unknown error'}`)
        setPlayerData(defaultPlayerData)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayerData()
  }, [puuid])

  // Use real stats from S3 when available, fallback to sample data
  const stats = s3PlayerData?.stats
  const kpiData = [
    {
      label: "Win Rate",
      value: stats ? `${stats.winRate}%` : 
        (playerData.wins + playerData.losses > 0 ? Math.round((playerData.wins / (playerData.wins + playerData.losses)) * 100) + "%" : "-"),
      change: 2,
      sparkline: [52, 54, 53, 55, 56, 57, 58],
    },
    {
      label: "KDA",
      value: stats ? stats.kda.toString() : "3.2",
      change: 0.1,
      sparkline: [2.8, 3.0, 3.1, 3.2, 3.3, 3.2, 3.2],
    },
    {
      label: "LP",
      value: playerData.leaguePoints.toString(),
      change: 12,
      sparkline: [40, 55, 60, 67, 70, 80, 67],
    },
  ]

  // Use real match data when available
  const matches = (s3PlayerData?.matches && s3PlayerData.matches.length > 0)
    ? s3PlayerData.matches.slice(0, 20).map((match: any) => {
        const participant = match.info?.participants?.find((p: any) => p.puuid === puuid)
        if (!participant) return null
        
        return {
          id: match.metadata.matchId,
          champion: participant.championName,
          result: participant.win ? "win" : "loss",
          kda: `${participant.kills}/${participant.deaths}/${participant.assists}`,
          cs: (participant.totalMinionsKilled || 0) + (participant.neutralMinionsKilled || 0),
          duration: `${Math.floor((match.info.gameDuration || 0) / 60)}m ${(match.info.gameDuration || 0) % 60}s`,
          tags: [],
        }
      }).filter(Boolean)
    : sampleMatches.map((m) => ({
        id: m.matchId,
        champion: m.champion,
        result: m.win ? "win" : "loss",
        kda: `${m.kills}/${m.deaths}/${m.assists}`,
        cs: m.cs,
        duration: `${Math.floor(m.duration / 60)}m ${m.duration % 60}s`,
        tags: [],
      }))

  // Generate hidden gems based on player performance
  const generateHiddenGems = () => {
    const gems = []
    const winRate = playerData.wins + playerData.losses > 0 ? 
      Math.round((playerData.wins / (playerData.wins + playerData.losses)) * 100) : 50
    const kda = stats ? parseFloat(stats.kda) : 2.5
    
    // Gem based on champion performance
    if (stats?.topChampions && stats.topChampions.length > 0) {
      const topChamp = stats.topChampions[0]
      if (topChamp.winRate > winRate + 5) {
        gems.push({
          strength: `${topChamp.champion} Mastery`,
          evidence: `Your ${topChamp.champion} win rate is ${topChamp.winRate}%, ${topChamp.winRate - winRate}% above your average. ${topChamp.games} games of experience shows.`
        })
      }
    }
    
    // KDA-based gem
    if (kda > 3.0) {
      gems.push({
        strength: "Superior KDA Control",
        evidence: `Maintaining ${kda} KDA across all games. Your death prevention and kill participation is exceptional.`
      })
    }
    
    // Win rate gem
    if (winRate >= 60) {
      gems.push({
        strength: "Consistent Victory Pattern",
        evidence: `${winRate}% win rate shows you understand how to close out games and make winning plays consistently.`
      })
    }
    
    // LP climbing gem
    if (playerData.leaguePoints > 1500) {
      gems.push({
        strength: "High Elo Adaptation", 
        evidence: `Performing at ${playerData.leaguePoints} LP demonstrates ability to adapt to higher skill gameplay and macro decisions.`
      })
    }
    
    // Fallback gems if no specific patterns
    if (gems.length === 0) {
      gems.push({
        strength: "Steady Improvement",
        evidence: "Your consistent game participation shows dedication to improving your gameplay fundamentals."
      })
    }
    
    return gems.slice(0, 2) // Limit to 2 gems
  }

  const hiddenGems = generateHiddenGems()

  // Temporary placeholder - will be calculated after championHeatmapData
  const roleData = [
    { role: "Mid", games: Math.round((playerData.wins + playerData.losses) * 0.6), winRate: Math.round((playerData.wins / (playerData.wins + playerData.losses)) * 100) || 50 },
    { role: "Top", games: Math.round((playerData.wins + playerData.losses) * 0.2), winRate: Math.round((playerData.wins / (playerData.wins + playerData.losses)) * 100) || 50 },
    { role: "ADC", games: Math.round((playerData.wins + playerData.losses) * 0.1), winRate: Math.round((playerData.wins / (playerData.wins + playerData.losses)) * 100) || 50 },
    { role: "Support", games: Math.round((playerData.wins + playerData.losses) * 0.05), winRate: Math.round((playerData.wins / (playerData.wins + playerData.losses)) * 100) || 50 },
    { role: "Jungle", games: Math.round((playerData.wins + playerData.losses) * 0.05), winRate: Math.round((playerData.wins / (playerData.wins + playerData.losses)) * 100) || 50 },
  ]

  // Calculate objective control data from stats
  const calculateObjectiveData = () => {
    if (stats?.patchDistribution) {
      // Use real patch distribution from stats
      return Object.entries(stats.patchDistribution).map(([patch, games]) => {
        // Estimate objectives based on games played and average performance
        const totalGames = games as number
        const winRate = stats.winRate / 100
        
        // Estimate based on average objectives per game and win rate
        const avgDragonsPerGame = 1.8 + (winRate * 0.8) // Winners get more drakes
        const avgHeraldsPerGame = 0.7 + (winRate * 0.5)
        const avgBaronsPerGame = 0.4 + (winRate * 0.6)
        
        return {
          patch: patch.replace('15.', '14.'), // Convert to display format
          dragons: Math.round(totalGames * avgDragonsPerGame),
          heralds: Math.round(totalGames * avgHeraldsPerGame),
          barons: Math.round(totalGames * avgBaronsPerGame),
        }
      }).slice(0, 6) // Limit to 6 patches
    } else {
      // Fallback based on total games and performance
      const totalGames = playerData.wins + playerData.losses
      const winRate = totalGames > 0 ? playerData.wins / totalGames : 0.5
      
      return Array.from({ length: 6 }, (_, i) => {
        const patch = `14.${i + 1}`
        // Use deterministic calculation instead of random
        const pseudoRandom = ((playerData.wins + playerData.losses + i * 7) % 5)
        const gamesInPatch = Math.round(totalGames / 6) + pseudoRandom
        
        return {
          patch,
          dragons: Math.round(gamesInPatch * (1.5 + winRate)),
          heralds: Math.round(gamesInPatch * (0.6 + winRate * 0.4)),
          barons: Math.round(gamesInPatch * (0.3 + winRate * 0.5)),
        }
      })
    }
  }

  const objectiveControlData = calculateObjectiveData()

  // Calculate KDA histogram data from player stats
  const calculateHistogramData = () => {
    const totalGames = playerData.wins + playerData.losses
    const avgKills = stats?.avgKills || 5.5
    const avgDeaths = stats?.avgDeaths || 5.0
    const avgAssists = stats?.avgAssists || 8.0
    
    // Create distribution based on averages (normal distribution simulation)
    const ranges = ["0-2", "3-5", "6-8", "9-11", "12-14", "15-17", "18+"]
    
    return ranges.map(range => {
      const [min, maxStr] = range.split("-")
      const max = maxStr === undefined ? 100 : parseInt(maxStr) // Handle "18+" case
      const rangeCenter = maxStr === undefined ? 20 : (parseInt(min) + parseInt(maxStr)) / 2
      
      // Calculate likelihood based on distance from average (simple normal distribution)
      const killsLikelihood = Math.exp(-Math.pow(rangeCenter - avgKills, 2) / (2 * 9)) // variance ~9
      const deathsLikelihood = Math.exp(-Math.pow(rangeCenter - avgDeaths, 2) / (2 * 9))
      const assistsLikelihood = Math.exp(-Math.pow(rangeCenter - avgAssists, 2) / (2 * 16)) // assists have higher variance
      
      return {
        range,
        kills: Math.round(totalGames * killsLikelihood * 0.4), // Scale factors
        deaths: Math.round(totalGames * deathsLikelihood * 0.4),
        assists: Math.round(totalGames * assistsLikelihood * 0.6),
      }
    })
  }

  const histogramData = calculateHistogramData()

  // Generate comeback data based on player performance
  const [comebackData, setComebackData] = useState<any[]>([])
  const [currentMatchId, setCurrentMatchId] = useState<string>("")
  const [timelineData, setTimelineData] = useState<any[]>([])
  const [timelineLoading, setTimelineLoading] = useState(false)
  
  // Claude Analysis State
  const [claudeInsights, setClaudeInsights] = useState<any>(null)
  const [claudeRoast, setClaudeRoast] = useState<any>(null)
  const [claudeImprovement, setClaudeImprovement] = useState<any>(null)
  const [claudeLoading, setClaudeLoading] = useState(false)
  const [claudeError, setClaudeError] = useState<string | null>(null)

  // Fetch real timeline data for the most recent match
  useEffect(() => {
    if (!s3PlayerData?.matches || s3PlayerData.matches.length === 0) {
      // Fallback to synthetic data if no matches
      const generateFallbackData = () => {
        const winRate = playerData.wins + playerData.losses > 0 ? 
          playerData.wins / (playerData.wins + playerData.losses) : 0.5
        
        return [
          { time: 0, goldDiff: 0 },
          { time: 5, goldDiff: Math.round((winRate - 0.5) * 1000) },
          { time: 10, goldDiff: Math.round((winRate - 0.5) * 1800) },
          { time: 15, goldDiff: Math.round((winRate - 0.5) * 2400) },
          { time: 20, goldDiff: Math.round((winRate - 0.5) * 2800) },
          { time: 25, goldDiff: Math.round((winRate - 0.5) * 3200) },
          { time: 30, goldDiff: Math.round((winRate - 0.5) * 3600) },
          { time: 35, goldDiff: Math.round((winRate - 0.5) * 4000) },
        ]
      }
      setComebackData(generateFallbackData())
      return
    }

    const fetchTimelineData = async () => {
      try {
        setTimelineLoading(true)
        
        // Get the most recent match
        const recentMatch = s3PlayerData.matches[0]
        const matchId = recentMatch?.metadata?.matchId
        
        if (!matchId) return
        
        setCurrentMatchId(matchId)
        
        // Determine cluster/platform from S3 data
        const cluster = s3PlayerData.manifest?.routing || "ASIA"
        const platform = s3PlayerData.manifest?.platform || "KR"
        
        // Fetch timeline for the most recent match (for comeback data)
        const response = await fetch(`/api/s3/timeline?puuid=${puuid}&matchId=${matchId}&cluster=${cluster}&platform=${platform}`)
        
        if (response.ok) {
          const timelineResult = await response.json()
          setComebackData(timelineResult.goldDifference || [])
          console.log("Real timeline data loaded for match:", matchId)
        }
        
        // Fetch timeline data for multiple recent matches (for advanced analysis)
        const recentMatches = s3PlayerData.matches.slice(0, 5) // Get last 5 matches
        const timelinePromises = recentMatches.map(async (match: any) => {
          const mId = match?.metadata?.matchId
          if (!mId) return null
          
          try {
            const response = await fetch(`/api/s3/timeline?puuid=${puuid}&matchId=${mId}&cluster=${cluster}&platform=${platform}`)
            if (response.ok) {
              return await response.json()
            }
          } catch (error) {
            console.error(`Failed to fetch timeline for match ${mId}:`, error)
          }
          return null
        })
        
        const timelineResults = await Promise.all(timelinePromises)
        const validTimelines = timelineResults.filter(Boolean)
        setTimelineData(validTimelines)
        console.log(`Loaded ${validTimelines.length} timeline files for advanced analysis`)
        
      } catch (error) {
        console.error("Failed to fetch timeline data:", error)
      } finally {
        setTimelineLoading(false)
      }
    }

    fetchTimelineData()
  }, [s3PlayerData, puuid])

  // Fetch Claude Analysis when player data is available
  useEffect(() => {
    if (!puuid || !s3PlayerData) return

    const fetchClaudeAnalysis = async () => {
      try {
        setClaudeLoading(true)
        setClaudeError(null)

        // Fetch all three analysis types in parallel
        const [insightsResponse, roastResponse, improvementResponse] = await Promise.all([
          fetch('/api/claude-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              puuid,
              analysisType: 'insights',
              includeMatches: false
            })
          }),
          fetch('/api/claude-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              puuid,
              analysisType: 'roast',
              includeMatches: false
            })
          }),
          fetch('/api/claude-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              puuid,
              analysisType: 'improvement',
              includeMatches: true,
              matchLimit: 5
            })
          })
        ])

        if (insightsResponse.ok) {
          const insights = await insightsResponse.json()
          setClaudeInsights(insights)
          console.log('Claude insights loaded')
        }

        if (roastResponse.ok) {
          const roast = await roastResponse.json()
          setClaudeRoast(roast)
          console.log('Claude roast loaded')
        }

        if (improvementResponse.ok) {
          const improvement = await improvementResponse.json()
          setClaudeImprovement(improvement)
          console.log('Claude improvement analysis loaded')
        }

      } catch (error) {
        console.error('Failed to fetch Claude analysis:', error)
        setClaudeError('Failed to load AI analysis')
      } finally {
        setClaudeLoading(false)
      }
    }

    // Only fetch Claude analysis if we have comprehensive data
    if (s3PlayerData.matches && s3PlayerData.matches.length > 50) {
      fetchClaudeAnalysis()
    }
  }, [puuid, s3PlayerData])

  // Generate performance timeline based on real match data
  const generatePerformanceTimelineData = () => {
    if (!s3PlayerData?.matches || s3PlayerData.matches.length === 0) return []
    
    // Use raw S3 match data
    const rawMatches = s3PlayerData.matches
    
    // Sort matches by date (oldest first)
    const sortedMatches = rawMatches
      .filter((match: any) => match?.info?.gameCreation)
      .sort((a: any, b: any) => (a.info.gameCreation || 0) - (b.info.gameCreation || 0))
    
    const timelineData: any[] = []
    let cumulativeWins = 0
    let cumulativeLosses = 0
    
    // Group matches by week to reduce noise
    const weeklyData: { [key: string]: { wins: number; losses: number; date: Date } } = {}
    
    sortedMatches.forEach((match: any) => {
      const matchDate = new Date(match.info.gameCreation)
      // Get start of week (Sunday)
      const weekStart = new Date(matchDate)
      weekStart.setDate(matchDate.getDate() - matchDate.getDay())
      weekStart.setHours(0, 0, 0, 0)
      const weekKey = weekStart.toISOString().split('T')[0]
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { wins: 0, losses: 0, date: weekStart }
      }
      
      // Find this player's participation in the match
      const participant = match.info?.participants?.find((p: any) => p.puuid === puuid)
      if (participant) {
        if (participant.win) {
          weeklyData[weekKey].wins++
        } else {
          weeklyData[weekKey].losses++
        }
      }
    })
    
    // Convert to timeline format
    const sortedWeeks = Object.entries(weeklyData).sort(([a], [b]) => a.localeCompare(b))
    
    sortedWeeks.forEach(([weekKey, weekData]) => {
      cumulativeWins += weekData.wins
      cumulativeLosses += weekData.losses
      const totalGames = cumulativeWins + cumulativeLosses
      const winRate = totalGames > 0 ? (cumulativeWins / totalGames) * 100 : 50
      
      timelineData.push({
        date: weekKey,
        lp: winRate, // Use win rate as "progress" instead of LP
        wins: cumulativeWins,
        losses: cumulativeLosses,
        winRate: Math.round(winRate * 10) / 10, // Round to 1 decimal
        tier: playerData.tier || "UNRANKED",
        rank: playerData.rank || "",
        gamesThisWeek: weekData.wins + weekData.losses
      })
    })
    
    return timelineData
  }

  const performanceTimelineData = generatePerformanceTimelineData()

  // Use real champion performance data when available
  const championPerformanceData = stats?.topChampions || []

  // Create champion heatmap data from S3 stats
  const championHeatmapData = stats?.champions ? Object.entries(stats.champions).map(([championName, championStats]: [string, any]) => {
    const winRate = championStats.wins > 0 ? Math.round((championStats.wins / championStats.games) * 100) : 0
    
    // More comprehensive role mapping for Faker's champions
    const roleMap: Record<string, string> = {
      // Mid laners
      "Azir": "Mid", "Corki": "Mid", "Twisted Fate": "Mid", "Lissandra": "Mid", 
      "LeBlanc": "Mid", "Orianna": "Mid", "Syndra": "Mid", "Galio": "Mid",
      "Akali": "Mid", "Yasuo": "Mid", "Zed": "Mid", "Cassiopeia": "Mid",
      
      // Supports (common in pro play)
      "TahmKench": "Support", "Braum": "Support", "Morgana": "Support",
      "Nautilus": "Support", "Thresh": "Support", "Alistar": "Support",
      
      // Junglers 
      "LeeSin": "Jungle", "XinZhao": "Jungle", "Graves": "Jungle", 
      "Kindred": "Jungle", "Nidalee": "Jungle", "Elise": "Jungle",
      
      // Top laners
      "Aatrox": "Top", "Jayce": "Top", "MonkeyKing": "Top", "Ambessa": "Top",
      "Gnar": "Top", "Camille": "Top", "Fiora": "Top", "Renekton": "Top",
      
      // ADC
      "Tristana": "ADC", "Jinx": "ADC", "Caitlyn": "ADC", "Ezreal": "ADC",
      "Lucian": "ADC", "Kai'Sa": "ADC", "Aphelios": "ADC",
    }
    
    const role = roleMap[championName] || "Mid" // Default to Mid for unknown champions
    
    return {
      name: championName,
      games: championStats.games,
      winRate: winRate,
      role: role,
      size: championStats.games,
    }
  }).sort((a, b) => b.games - a.games) : []

  console.log("Champion heatmap data with roles:", championHeatmapData)
  console.log("Total champions:", championHeatmapData.length)
  console.log("Role breakdown:", championHeatmapData.reduce((acc: any, champ) => {
    acc[champ.role] = (acc[champ.role] || 0) + 1
    return acc
  }, {}))

  // Calculate real role distribution from champion data
  const realRoleData = championHeatmapData.length > 0 ? (() => {
    const roleStats: Record<string, { games: number, wins: number }> = {}
    
    // Aggregate champion data by role
    championHeatmapData.forEach(champ => {
      if (!roleStats[champ.role]) {
        roleStats[champ.role] = { games: 0, wins: 0 }
      }
      roleStats[champ.role].games += champ.games
      roleStats[champ.role].wins += Math.round(champ.games * champ.winRate / 100)
    })
    
    // Convert to array format with win rates
    return Object.entries(roleStats)
      .map(([role, stats]) => ({
        role,
        games: stats.games,
        winRate: stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0
      }))
      .sort((a, b) => b.games - a.games) // Sort by most played
  })() : roleData // Use fallback data when no champion data available

  // Generate real AI insights now that we have all the data
  const realAIInsights = (() => {
    const insights = []
    const winRate = playerData.wins + playerData.losses > 0 ? 
      Math.round((playerData.wins / (playerData.wins + playerData.losses)) * 100) : 50
    const kda = stats ? parseFloat(stats.kda) : 2.5
    
    // Macro insight
    if (winRate >= 55) {
      insights.push({
        type: "macro" as const,
        title: "Objective Control Excellence",
        description: `Your ${winRate}% win rate suggests strong macro decision making. Continue prioritizing objectives and team coordination.`,
        evidence: `${winRate}% overall WR`
      })
    } else {
      insights.push({
        type: "macro" as const,
        title: "Focus on Objective Priority",
        description: "Improving objective control could boost your win rate. Prioritize dragon setups and herald plays for map pressure.",
        evidence: "Win rate opportunity"
      })
    }
    
    // Micro insight based on KDA
    if (kda >= 3.0) {
      insights.push({
        type: "micro" as const,
        title: "Superior Individual Performance",
        description: `Your ${kda} KDA demonstrates excellent mechanics and positioning. Your individual skill is carrying games.`,
        evidence: `${kda} average KDA`
      })
    } else {
      insights.push({
        type: "micro" as const,
        title: "Mechanical Consistency",
        description: "Focus on reducing deaths while maintaining kill participation. Better positioning in team fights could improve your impact.",
        evidence: `${kda} KDA improvement target`
      })
    }
    
    // Draft insight based on champion performance
    if (stats?.topChampions && stats.topChampions.length > 0) {
      const topChamp = stats.topChampions[0]
      insights.push({
        type: "draft" as const,
        title: `${topChamp.champion} Mastery Advantage`,
        description: `Your ${topChamp.champion} shows ${topChamp.winRate}% win rate. Continue prioritizing comfort picks in ranked games.`,
        evidence: `${topChamp.winRate}% WR on ${topChamp.champion}`
      })
    } else {
      insights.push({
        type: "draft" as const,
        title: "Champion Pool Expansion",
        description: "Developing deeper mastery on 2-3 champions could improve consistency. Focus on meta picks that fit your playstyle.",
        evidence: "Champion mastery opportunity"
      })
    }
    
    return insights
  })()

  // Generate patch trends data from S3 match data
  const generatePatchTrendsData = () => {
    if (!stats?.patchDistribution) {
      // Fallback patch data if no real data available
      const totalGames = playerData.wins + playerData.losses
      const baseWinRate = totalGames > 0 ? (playerData.wins / totalGames) * 100 : 50
      const baseKDA = stats?.kda || 2.5
      
      return [
        { patch: "14.13", winRate: baseWinRate + 3, kda: baseKDA + 0.2, games: Math.floor(totalGames * 0.15) },
        { patch: "14.14", winRate: baseWinRate - 2, kda: baseKDA - 0.1, games: Math.floor(totalGames * 0.18) },
        { patch: "14.15", winRate: baseWinRate + 1, kda: baseKDA + 0.05, games: Math.floor(totalGames * 0.20) },
        { patch: "15.11", winRate: baseWinRate - 1, kda: baseKDA - 0.05, games: Math.floor(totalGames * 0.22) },
        { patch: "15.12", winRate: baseWinRate + 4, kda: baseKDA + 0.3, games: Math.floor(totalGames * 0.25) },
      ]
    }
    
    // Use real patch distribution from S3 data
    const patchEntries = Object.entries(stats.patchDistribution)
      .sort(([a], [b]) => a.localeCompare(b)) // Sort patches chronologically
      .slice(-8) // Take last 8 patches for trends
    
    return patchEntries.map(([patch, gamesInPatch]: [string, any]) => {
      // Calculate win rate for this patch by sampling matches
      const matches = s3PlayerData?.matches || []
      const patchMatches = matches.filter((match: any) => {
        const gameVersion = match?.info?.gameVersion || ""
        const matchPatch = gameVersion.split('.').slice(0, 2).join('.')
        return matchPatch === patch
      })
      
      let patchWinRate = 50
      let patchKDA = 2.5
      
      if (patchMatches.length > 0) {
        let wins = 0
        let kills = 0, deaths = 0, assists = 0
        
        patchMatches.forEach((match: any) => {
          const participant = match?.info?.participants?.find((p: any) => p.puuid === puuid)
          if (participant) {
            if (participant.win) wins++
            kills += participant.kills || 0
            deaths += participant.deaths || 1
            assists += participant.assists || 0
          }
        })
        
        patchWinRate = Math.round((wins / patchMatches.length) * 100)
        patchKDA = deaths > 0 ? parseFloat(((kills + assists) / deaths).toFixed(2)) : kills + assists
      }
      
      return {
        patch: patch,
        winRate: patchWinRate,
        kda: patchKDA,
        games: gamesInPatch as number
      }
    })
  }

  const patchTrendsData = generatePatchTrendsData()

  // Generate objective participation data from match analysis
  const generateObjectiveParticipationData = () => {
    if (!s3PlayerData?.matches || s3PlayerData.matches.length === 0) {
      // Fallback objective data
      return [
        { name: "Dragons", value: 65, color: "oklch(0.7 0.2 195)" },
        { name: "Herald/Baron", value: 45, color: "oklch(0.65 0.25 300)" },
        { name: "Towers", value: 78, color: "oklch(0.75 0.18 240)" },
        { name: "Epic Monsters", value: 55, color: "oklch(0.6 0.22 320)" }
      ]
    }

    const matches = s3PlayerData.matches
    const totalGames = matches.length
    const avgWinRate = stats?.winRate || 50
    
    // Estimate objective participation based on win rate and role
    const primaryRole = realRoleData[0]?.role || "Mid"
    const roleMultipliers = {
      "Support": { dragons: 0.85, herald: 0.75, towers: 0.65, epic: 0.80 },
      "Jungle": { dragons: 0.90, herald: 0.95, towers: 0.70, epic: 0.95 },
      "Mid": { dragons: 0.75, herald: 0.70, towers: 0.85, epic: 0.75 },
      "Top": { dragons: 0.65, herald: 0.80, towers: 0.80, epic: 0.70 },
      "ADC": { dragons: 0.80, herald: 0.65, towers: 0.90, epic: 0.75 }
    }
    
    const multipliers = roleMultipliers[primaryRole as keyof typeof roleMultipliers] || roleMultipliers.Mid
    const winRateBonus = (avgWinRate - 50) / 100 // Convert to decimal bonus
    
    return [
      {
        name: "Dragons",
        value: Math.round((65 + winRateBonus * 20) * multipliers.dragons),
        color: "oklch(0.7 0.2 195)"
      },
      {
        name: "Herald/Baron",
        value: Math.round((45 + winRateBonus * 15) * multipliers.herald),
        color: "oklch(0.65 0.25 300)"
      },
      {
        name: "Towers",
        value: Math.round((78 + winRateBonus * 18) * multipliers.towers),
        color: "oklch(0.75 0.18 240)"
      },
      {
        name: "Epic Monsters",
        value: Math.round((55 + winRateBonus * 20) * multipliers.epic),
        color: "oklch(0.6 0.22 320)"
      }
    ]
  }

  const objectiveParticipationData = generateObjectiveParticipationData()

  // Generate real roast data now that we have all the data
  const realRoastData = (() => {
    const winRate = playerData.wins + playerData.losses > 0 ? 
      Math.round((playerData.wins / (playerData.wins + playerData.losses)) * 100) : 50
    const kda = stats ? parseFloat(stats.kda) : 2.5
    
    if (winRate < 45) {
      return {
        roast: `${winRate}% win rate? Even a coinflip would be disappointed in you. Time to stop blaming your teammates and start looking in the mirror.`,
        challenge: `Win 3 games in a row to prove you can actually carry your own weight.`
      }
    } else if (kda < 2.0) {
      return {
        roast: `Your KDA of ${kda} suggests you're feeding more than a charity kitchen. Maybe try playing safer instead of trying to be the hero every fight?`,
        challenge: `Achieve a 3.0 KDA in your next 5 games by focusing on positioning and map awareness.`
      }
    } else if (playerData.leaguePoints < 1000) {
      return {
        roast: `Stuck in the depths of ${playerData.tier} with ${playerData.leaguePoints} LP? Even the tutorial bots are looking down on you. Time to step up your game.`,
        challenge: `Climb 200 LP by focusing on fundamentals: CS, warding, and not overextending.`
      }
    } else {
      return {
        roast: `You're playing it too safe! Your ${winRate}% win rate shows you can win, but where's the risk-taking? Stop being a KDA player and make some plays.`,
        challenge: `Go for riskier plays in your next 3 games - sometimes you need to int to win.`
      }
    }
  })()

  // Don't render dynamic content until hydrated to prevent hydration mismatch
  if (!hydrated) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,oklch(0.70_0.20_195_/_0.1),transparent_50%)]" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,oklch(0.70_0.20_195_/_0.1),transparent_50%)]" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 glass-strong sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-xl font-heading font-bold text-gradient-cyan">Rift Rewind</span>
            </Link>
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto glass-strong">
                  <DialogHeader>
                    <DialogTitle>Share Your Recap</DialogTitle>
                    <DialogDescription>Create a shareable card and export your stats</DialogDescription>
                  </DialogHeader>
                  <ShareCardComposer
                    player={{
                      summonerName: playerData.summonerName,
                      tagline: playerData.tagline,
                      tier: playerData.tier,
                      rank: playerData.rank,
                    }}
                    stats={{
                      winRate: kpiData[0].value,
                      kda: kpiData[1].value,
                      games: 0, // placeholder
                      topChampion: "-", // placeholder
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 space-y-8">
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading player data...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-destructive mb-2">⚠️ {error}</p>
              <p className="text-sm text-muted-foreground">Showing sample data instead</p>
            </div>
          )}

          {/* Profile and KPIs */}
          <div className="flex flex-col md:flex-row gap-8">
            <ProfileBadge player={playerData} />
            <KpiStrip kpis={kpiData} />
          </div>

          {/* Data Source Indicator */}
          {s3PlayerData?.manifest && (
            <div className="text-center">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                s3PlayerData.manifest.source === 'live-api' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  s3PlayerData.manifest.source === 'live-api' ? 'bg-green-500' : 'bg-blue-500'
                }`}></div>
                {s3PlayerData.manifest.source === 'live-api' 
                  ? `Live Data (${(s3PlayerData.manifest.platform || s3PlayerData.manifest.region || 'API').toUpperCase()})`
                  : 'Archived Data (S3)'
                }
              </div>
            </div>
          )}

          {/* Tabs for dashboard sections */}
          <Tabs defaultValue="matches" className="w-full">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="matches">Matches</TabsTrigger>
                <TabsTrigger value="champions">Champions</TabsTrigger>
                <TabsTrigger value="insights">AI Insights</TabsTrigger>
              </TabsList>
              
              {/* Claude Analysis Trigger Button */}
              {puuid && s3PlayerData && !claudeInsights && !claudeLoading && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Trigger Claude analysis manually
                    const fetchClaudeAnalysis = async () => {
                      try {
                        setClaudeLoading(true)
                        setClaudeError(null)

                        const [insightsResponse, roastResponse] = await Promise.all([
                          fetch('/api/claude-analysis', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              puuid,
                              analysisType: 'insights',
                              includeMatches: false
                            })
                          }),
                          fetch('/api/claude-analysis', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              puuid,
                              analysisType: 'roast',
                              includeMatches: false
                            })
                          })
                        ])

                        if (insightsResponse.ok) {
                          const insights = await insightsResponse.json()
                          setClaudeInsights(insights)
                        }

                        if (roastResponse.ok) {
                          const roast = await roastResponse.json()
                          setClaudeRoast(roast)
                        }

                      } catch (error) {
                        console.error('Failed to fetch Claude analysis:', error)
                        setClaudeError('Failed to load AI analysis')
                      } finally {
                        setClaudeLoading(false)
                      }
                    }
                    fetchClaudeAnalysis()
                  }}
                  className="bg-transparent"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Claude Analysis
                </Button>
              )}
            </div>

            <TabsContent value="matches" className="space-y-6">
              <MatchList matches={matches as any} />
              <ObjectiveControlBar data={objectiveControlData} />
              <PerformanceHistogram data={histogramData} />
              <ComebackTempo data={comebackData} matchId={currentMatchId || "loading"} result="win" />
            </TabsContent>

            <TabsContent value="champions" className="space-y-6">
              <ChampionPerformanceBar data={championPerformanceData} />
              <ChampionHeatmap champions={championHeatmapData} />
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              {/* Claude Analysis Loading State */}
              {claudeLoading && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">🧠 Claude is analyzing your gameplay...</p>
                  <p className="text-sm text-muted-foreground">This may take 30-60 seconds for comprehensive analysis</p>
                </motion.div>
              )}
              
              {/* Claude Error State */}
              {claudeError && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
                  <p className="text-destructive">❌ {claudeError}</p>
                  <p className="text-sm text-muted-foreground mt-2">Showing basic analysis instead</p>
                </motion.div>
              )}

              {/* AI Insights - Enhanced with Claude */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                {claudeInsights ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <h2 className="text-xl font-heading font-bold">🧠 Claude's Professional Analysis</h2>
                      <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                        {claudeInsights.metadata?.total_data_points || 0} matches analyzed
                      </div>
                    </div>
                    <Card className="glass-strong p-6">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div style={{ whiteSpace: 'pre-line' }} className="text-muted-foreground">
                          {claudeInsights.claude_analysis}
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>⚡ Analysis time: {claudeInsights.metadata?.analysis_time_ms}ms</span>
                        <span>🎯 Model: {claudeInsights.metadata?.model_used}</span>
                      </div>
                    </Card>
                  </div>
                ) : (
                  <AIInsights insights={realAIInsights} />
                )}
              </motion.div>

              {/* Roast Section - Enhanced with Claude */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                {claudeRoast ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl">🔥</span>
                      <h2 className="text-xl font-heading font-bold">Claude's Savage Roast</h2>
                    </div>
                    <Card className="glass-strong p-6 border-destructive/20">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div style={{ whiteSpace: 'pre-line' }} className="text-muted-foreground">
                          {claudeRoast.claude_analysis}
                        </div>
                      </div>
                    </Card>
                  </div>
                ) : (
                  <RoastSection roast={realRoastData.roast} challenge={realRoastData.challenge} />
                )}
              </motion.div>

              {/* Improvement Analysis - New Claude Section */}
              {claudeImprovement && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl">🎯</span>
                      <h2 className="text-xl font-heading font-bold">Elite Coaching Analysis</h2>
                      <div className="bg-green-500/10 text-green-600 px-2 py-1 rounded text-xs font-medium">
                        {claudeImprovement.metadata?.matches_included || 0} recent matches analyzed
                      </div>
                    </div>
                    <Card className="glass-strong p-6 border-green-500/20">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div style={{ whiteSpace: 'pre-line' }} className="text-muted-foreground">
                          {claudeImprovement.claude_analysis}
                        </div>
                      </div>
                    </Card>
                  </div>
                </motion.div>
              )}

              {/* Hidden Gems */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                <HiddenGems gems={hiddenGems} />
              </motion.div>
            </TabsContent>
          </Tabs>

          {/* Performance Timeline with Patch Trends Toggle - Full Width */}
          <div className="w-full">
            <RankProgression data={performanceTimelineData} patchData={patchTrendsData} />
          </div>

          {/* Role Distribution and Objective Participation */}
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2">
              <RoleDistribution data={realRoleData} />
            </div>
            <div className="w-full md:w-1/2">
              <ObjectiveDonut data={objectiveParticipationData} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
