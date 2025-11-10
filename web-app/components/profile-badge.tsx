"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy } from "lucide-react"

interface ProfileBadgeProps {
  player: {
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
}

export function ProfileBadge({ player }: ProfileBadgeProps) {
  const totalGames = player.wins + player.losses
  const winRate = totalGames > 0 ? ((player.wins / totalGames) * 100).toFixed(1) : "0.0"

  return (
    <Card className="glass neon-glow p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative"
        >
          <Avatar className="w-24 h-24 border-4 border-primary/50">
            <AvatarImage
              src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/profileicon/${player.profileIcon}.png`}
              alt={player.summonerName}
            />
            <AvatarFallback>{player.summonerName[0]}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold border-2 border-background">
            {player.level}
          </div>
        </motion.div>

        {/* Info */}
        <div className="flex-1 space-y-3">
          <div>
            <h1 className="text-3xl font-bold text-gradient-cyan">
              {player.summonerName}
              <span className="text-muted-foreground">#{player.tagline}</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-lg font-semibold text-primary">
                {player.tier} {player.rank}
              </span>
              <span className="text-muted-foreground">• {player.leaguePoints} LP</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Win Rate:</span>
              <span className="font-bold text-primary">{winRate}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Games:</span>
              <span className="font-bold">
                {player.wins}W {player.losses}L
              </span>
            </div>
          </div>
        </div>

        {/* Rank Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="hidden lg:block"
        >
          <div className="w-32 h-32 relative">
            <img
              src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/ranked-emblem/emblem-${player.tier.toLowerCase()}.png`}
              alt={player.tier}
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback to unranked if the rank emblem fails to load
                e.currentTarget.src = "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/ranked-emblem/emblem-unranked.png"
              }}
            />
          </div>
        </motion.div>
      </div>
    </Card>
  )
}
