"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Trophy, Eye, Target, TrendingUp, Users, Shield, Lock } from "lucide-react"

interface Badge {
  id: string
  name: string
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
}

interface BadgeWallProps {
  badges: Badge[]
}

const iconMap = {
  trophy: Trophy,
  eye: Eye,
  target: Target,
  "trending-up": TrendingUp,
  users: Users,
  shield: Shield,
}

const rarityColors = {
  common: "text-muted-foreground",
  rare: "text-blue-400",
  epic: "text-secondary",
  legendary: "text-primary",
}

const rarityGlow = {
  common: "",
  rare: "hover:shadow-[0_0_20px_oklch(0.6_0.2_240_/_0.3)]",
  epic: "hover:shadow-[0_0_20px_oklch(0.65_0.25_300_/_0.3)]",
  legendary: "hover:neon-glow",
}

export function BadgeWall({ badges }: BadgeWallProps) {
  return (
    <Card className="glass p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Achievements</h2>
        <p className="text-sm text-muted-foreground">
          {badges.length} / 12 <span className="hidden sm:inline">unlocked</span>
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {badges.map((badge, index) => {
          const Icon = iconMap[badge.icon as keyof typeof iconMap] || Trophy

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <div
                className={`glass-strong rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 ${rarityGlow[badge.rarity]}`}
              >
                <div className={`${rarityColors[badge.rarity]}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <p className="text-xs text-center font-medium line-clamp-2">{badge.name}</p>
              </div>
            </motion.div>
          )
        })}

        {/* Locked badges */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={`locked-${i}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: (badges.length + i) * 0.05 }}
            className="group"
          >
            <div className="glass-strong rounded-lg p-4 flex flex-col items-center gap-2 opacity-30">
              <Lock className="w-8 h-8 text-muted-foreground" />
              <p className="text-xs text-center font-medium">Locked</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}
