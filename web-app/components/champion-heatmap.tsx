"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { useState } from "react"

interface Champion {
  name: string
  games: number
  winRate: number
  role: string
}

interface ChampionHeatmapProps {
  champions: Champion[]
}

export function ChampionHeatmap({ champions }: ChampionHeatmapProps) {
  const [roleFilter, setRoleFilter] = useState<string | null>(null)

  const filteredChampions = roleFilter ? champions.filter((c) => c.role === roleFilter) : champions

  const maxGames = Math.max(...champions.map((c) => c.games))

  const getSize = (games: number) => {
    const ratio = games / maxGames
    if (ratio > 0.7) return "w-24 h-24"
    if (ratio > 0.4) return "w-20 h-20"
    if (ratio > 0.2) return "w-16 h-16"
    return "w-12 h-12"
  }

  const getColor = (winRate: number) => {
    if (winRate >= 60) return "bg-primary/80 border-primary"
    if (winRate >= 50) return "bg-primary/50 border-primary/70"
    if (winRate >= 45) return "bg-muted border-border"
    return "bg-destructive/50 border-destructive/70"
  }

  return (
    <Card className="glass p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Champion Pool</h2>
        <div className="flex gap-2">
          <Button
            variant={roleFilter === null ? "default" : "outline"}
            size="sm"
            onClick={() => setRoleFilter(null)}
            className={roleFilter === null ? "neon-glow" : "bg-transparent"}
          >
            All
          </Button>
          {["Top", "Jungle", "Mid", "ADC", "Support"].map((role) => (
            <Button
              key={role}
              variant={roleFilter === role ? "default" : "outline"}
              size="sm"
              onClick={() => setRoleFilter(role)}
              className={roleFilter === role ? "neon-glow" : "bg-transparent hidden sm:inline-flex"}
            >
              {role}
            </Button>
          ))}
          <Button variant="outline" size="sm" className="bg-transparent sm:hidden">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {filteredChampions.map((champion, index) => (
          <motion.div
            key={champion.name}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.02 }}
            whileHover={{ scale: 1.1, zIndex: 10 }}
            className="group relative"
          >
            <div
              className={`${getSize(champion.games)} ${getColor(champion.winRate)} rounded-lg border-2 flex flex-col items-center justify-center p-2 cursor-pointer transition-all duration-300 hover:neon-glow`}
            >
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${champion.name}.png`}
                alt={champion.name}
                className="w-full h-full object-cover rounded"
                onError={(e) => {
                  // Fallback to a default champion icon if the champion image fails to load
                  e.currentTarget.src = "https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/Aatrox.png"
                }}
              />
              <div className="absolute inset-0 bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex flex-col items-center justify-center p-2">
                <p className="text-xs font-bold text-center mb-1">{champion.name}</p>
                <p className="text-xs text-muted-foreground">{champion.games}G</p>
                <p className="text-xs font-bold text-primary">{champion.winRate}%</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredChampions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No champions found for this role</p>
        </div>
      )}
    </Card>
  )
}
