"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search, User } from "lucide-react"
import { useRouter } from "next/navigation"

interface PlayerSearchProps {
  onPlayerFound?: (puuid: string, playerInfo: any) => void
}

export function PlayerSearch({ onPlayerFound }: PlayerSearchProps) {
  const [gameName, setGameName] = useState("")
  const [tagLine, setTagLine] = useState("")
  const [region, setRegion] = useState("americas")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const searchPlayer = async () => {
    if (!gameName || !tagLine) {
      setError("Please enter both Game Name and Tag Line")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // First, get the account info (PUUID) from Riot API
      const response = await fetch(`/api/riot/account?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}&region=${region}`)
      
      if (!response.ok) {
        throw new Error("Player not found")
      }

      const accountData = await response.json()
      const puuid = accountData.puuid

      // Navigate to the player's dashboard
      router.push(`/player/${puuid}`)

      // Optional callback
      if (onPlayerFound) {
        onPlayerFound(puuid, accountData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to find player")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchPlayer()
    }
  }

  // Quick access to players with saved S3 data
  const popularPlayers = [
    { 
      name: "Faker", 
      gameName: "Hide on bush", 
      tagLine: "KR1", 
      puuid: "-xcGtW5IiRCa5zoyKayq8FnDuyXKaZ4j3bGhzlnFTFCaN6pbXVwR8VrGwILuGMuQRFvQw5_hrhygyA", 
      region: "asia",
      cluster: "ASIA",
      platform: "KR"
    },
    { 
      name: "Doublelift", 
      gameName: "Dôûblêlift", 
      tagLine: "NA1", 
      puuid: "ffp34WTK663oriQM6rtCeG3HxmUlh8TLZkFiRAxCDP5zOgzJCv9oyTMyIiGQUb-uETHNMYZlfoGPZQ", 
      region: "americas",
      cluster: "AMERICAS", 
      platform: "NA1"
    },
  ]

  return (
    <Card className="glass p-8 w-full max-w-lg mx-auto backdrop-blur-md bg-gradient-to-br from-background/90 to-background/60 border-primary/20 shadow-2xl">
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-primary/10 border border-primary/20">
              <User className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Search Player
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter a Riot ID to view their League of Legends dashboard
          </p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/90">Game Name</label>
            <Input
              placeholder="e.g., Hide on bush"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/90">Tag Line</label>
            <Input
              placeholder="e.g., KR1"
              value={tagLine}
              onChange={(e) => setTagLine(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/90">Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              disabled={loading}
              className="flex h-12 w-full rounded-md border border-border/50 bg-background/50 px-4 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
            >
              <option value="americas">Americas (NA, BR, LAN, LAS)</option>
              <option value="asia">Asia (KR, JP)</option>
              <option value="europe">Europe (EUW, EUNE, TR, RU)</option>
              <option value="sea">SEA (PH2, SG2, TH2, TW2, VN2)</option>
            </select>
          </div>

          <Button 
            onClick={searchPlayer}
            disabled={loading || !gameName || !tagLine}
            className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Searching...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5" />
                <span>Search Player</span>
              </div>
            )}
          </Button>
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-4 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-destructive rounded-full"></div>
              {error}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}