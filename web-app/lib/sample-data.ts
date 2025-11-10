// Sample data for demo mode
export const samplePlayerData = {
  puuid: "sample-puuid-123",
  gameName: "DemoSummoner",
  tagLine: "NA1",
  summonerLevel: 247,
  profileIconId: 4568,
  tier: "PLATINUM",
  rank: "II",
  leaguePoints: 67,
}

export const sampleStats = {
  totalGames: 156,
  wins: 82,
  losses: 74,
  winRate: 52.6,
  kda: 3.2,
  avgKills: 7.8,
  avgDeaths: 5.2,
  avgAssists: 9.4,
  csPerMin: 6.8,
  visionScore: 42.3,
  damageShare: 24.5,
  goldPerMin: 385,
}

export const sampleChampions = [
  { name: "Jinx", games: 28, wins: 16, winRate: 57.1, kda: 3.8 },
  { name: "Caitlyn", games: 22, wins: 13, winRate: 59.1, kda: 3.5 },
  { name: "Kai'Sa", games: 18, wins: 9, winRate: 50.0, kda: 3.1 },
  { name: "Ashe", games: 15, wins: 8, winRate: 53.3, kda: 2.9 },
  { name: "Ezreal", games: 12, wins: 7, winRate: 58.3, kda: 3.4 },
]

export const sampleMatches = [
  {
    matchId: "NA1_1234567890",
    gameMode: "RANKED_SOLO_5x5",
    champion: "Jinx",
    win: true,
    kills: 12,
    deaths: 3,
    assists: 8,
    cs: 245,
    duration: 1845,
    timestamp: Date.now() - 86400000,
  },
  {
    matchId: "NA1_1234567891",
    gameMode: "RANKED_SOLO_5x5",
    champion: "Caitlyn",
    win: false,
    kills: 5,
    deaths: 7,
    assists: 11,
    cs: 198,
    duration: 1623,
    timestamp: Date.now() - 172800000,
  },
  {
    matchId: "NA1_1234567892",
    gameMode: "RANKED_SOLO_5x5",
    champion: "Kai'Sa",
    win: true,
    kills: 9,
    deaths: 4,
    assists: 13,
    cs: 223,
    duration: 1734,
    timestamp: Date.now() - 259200000,
  },
]

export const sampleBadges = [
  { id: "pentakill", name: "Pentakill Master", rarity: "legendary", unlocked: true },
  { id: "vision", name: "Vision King", rarity: "epic", unlocked: true },
  { id: "comeback", name: "Comeback Kid", rarity: "rare", unlocked: true },
  { id: "firstblood", name: "First Blood Hunter", rarity: "common", unlocked: true },
  { id: "baron", name: "Baron Stealer", rarity: "epic", unlocked: false },
]
