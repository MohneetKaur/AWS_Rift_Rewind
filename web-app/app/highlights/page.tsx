"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Trophy, Zap, Clock, Target, TrendingUp, Crosshair, Eye, Shield, Swords } from "lucide-react"
import Link from "next/link"

interface Highlight {
  id: string
  title: string
  description: string
  icon: string
  value: string
  date: string
  champion: string
  rarity: "common" | "rare" | "epic" | "legendary"
}

const highlights: Highlight[] = [
  {
    id: "1",
    title: "Perfect KDA",
    description: "Flawless game with 18 kills and 0 deaths",
    icon: "trophy",
    value: "18/0/12",
    date: "2 days ago",
    champion: "Syndra",
    rarity: "legendary",
  },
  {
    id: "2",
    title: "Epic Comeback",
    description: "Won after being down 8k gold at 20 minutes",
    icon: "trending-up",
    value: "-8k → Win",
    date: "5 days ago",
    champion: "Azir",
    rarity: "epic",
  },
  {
    id: "3",
    title: "Fastest Win",
    description: "Dominated and closed out in record time",
    icon: "zap",
    value: "19:42",
    date: "1 week ago",
    champion: "LeBlanc",
    rarity: "rare",
  },
  {
    id: "4",
    title: "Highest Damage",
    description: "Dealt the most damage in a single game",
    icon: "swords",
    value: "68,432",
    date: "1 week ago",
    champion: "Orianna",
    rarity: "epic",
  },
  {
    id: "5",
    title: "Vision Master",
    description: "Placed 45 wards in a single game",
    icon: "eye",
    value: "45 wards",
    date: "2 weeks ago",
    champion: "Twisted Fate",
    rarity: "rare",
  },
  {
    id: "6",
    title: "Objective Rush",
    description: "Secured all 4 drakes and baron",
    icon: "target",
    value: "5 objectives",
    date: "2 weeks ago",
    champion: "Azir",
    rarity: "epic",
  },
  {
    id: "7",
    title: "Clutch Baron",
    description: "Stole baron with 1% HP remaining",
    icon: "crosshair",
    value: "Baron Steal",
    date: "3 weeks ago",
    champion: "Viktor",
    rarity: "legendary",
  },
  {
    id: "8",
    title: "Unkillable",
    description: "Survived entire game with 0 deaths",
    icon: "shield",
    value: "0 deaths",
    date: "3 weeks ago",
    champion: "Orianna",
    rarity: "rare",
  },
  {
    id: "9",
    title: "CS God",
    description: "Perfect CS at 10 minutes",
    icon: "trophy",
    value: "107/107",
    date: "1 month ago",
    champion: "Azir",
    rarity: "epic",
  },
  {
    id: "10",
    title: "Longest Game",
    description: "Endured the longest battle of the season",
    icon: "clock",
    value: "58:23",
    date: "1 month ago",
    champion: "Cassiopeia",
    rarity: "common",
  },
]

const iconMap = {
  trophy: Trophy,
  zap: Zap,
  clock: Clock,
  target: Target,
  "trending-up": TrendingUp,
  crosshair: Crosshair,
  eye: Eye,
  shield: Shield,
  swords: Swords,
}

const rarityColors = {
  common: "border-muted-foreground/30",
  rare: "border-blue-400/50",
  epic: "border-secondary/50",
  legendary: "border-primary/50",
}

const rarityGlow = {
  common: "",
  rare: "hover:shadow-[0_0_20px_oklch(0.6_0.2_240_/_0.3)]",
  epic: "hover:neon-glow-purple",
  legendary: "hover:neon-glow",
}

export default function HighlightsPage() {
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
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold">Top 10 Moments</h1>
            </div>
            <p className="text-lg text-muted-foreground">Your most impressive achievements this season</p>
          </motion.div>

          {/* Highlights Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlights.map((highlight, index) => {
              const Icon = iconMap[highlight.icon as keyof typeof iconMap] || Trophy

              return (
                <motion.div
                  key={highlight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card
                    className={`glass p-6 h-full border-l-4 ${rarityColors[highlight.rarity]} ${rarityGlow[highlight.rarity]} transition-all duration-300 cursor-pointer`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-xs uppercase ${
                          highlight.rarity === "legendary"
                            ? "bg-primary/20 text-primary"
                            : highlight.rarity === "epic"
                              ? "bg-secondary/20 text-secondary"
                              : ""
                        }`}
                      >
                        {highlight.rarity}
                      </Badge>
                    </div>

                    <h3 className="text-xl font-bold mb-2">{highlight.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{highlight.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Value</span>
                        <span className="font-mono font-bold text-primary">{highlight.value}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Champion</span>
                        <span className="font-medium">{highlight.champion}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Date</span>
                        <span className="text-sm">{highlight.date}</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </main>
      </div>
    </div>
  )
}
