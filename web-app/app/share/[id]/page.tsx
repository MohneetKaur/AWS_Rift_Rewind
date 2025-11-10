"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ShareCardPage() {
  const player = {
    summonerName: "Faker",
    tagline: "T1",
    tier: "CHALLENGER",
    rank: "I",
  }

  const stats = {
    winRate: "53.4%",
    kda: "3.2",
    games: 640,
    topChampion: "Azir",
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,oklch(0.70_0.20_195_/_0.1),transparent_50%)]" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 glass-strong">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-xl font-heading font-bold text-gradient-cyan">Rift Rewind</span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">{player.summonerName}'s Season Recap</h1>
              <p className="text-lg text-muted-foreground">Check out their League of Legends journey</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass neon-glow p-8">
                <div className="space-y-6">
                  {/* Player Info */}
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20 border-4 border-primary/50">
                      <AvatarImage
                        src={`/placeholder.svg?height=80&width=80&query=league+profile`}
                        alt={player.summonerName}
                      />
                      <AvatarFallback>{player.summonerName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {player.summonerName}
                        <span className="text-muted-foreground">#{player.tagline}</span>
                      </h2>
                      <p className="text-lg text-primary font-semibold">
                        {player.tier} {player.rank}
                      </p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass-strong rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-primary">{stats.winRate}</p>
                      <p className="text-sm text-muted-foreground mt-1">Win Rate</p>
                    </div>
                    <div className="glass-strong rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-secondary">{stats.kda}</p>
                      <p className="text-sm text-muted-foreground mt-1">KDA</p>
                    </div>
                    <div className="glass-strong rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold">{stats.games}</p>
                      <p className="text-sm text-muted-foreground mt-1">Games</p>
                    </div>
                    <div className="glass-strong rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold">{stats.topChampion}</p>
                      <p className="text-sm text-muted-foreground mt-1">Top Pick</p>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="pt-4 border-t border-border/50">
                    <Button asChild className="w-full neon-glow" size="lg">
                      <Link href="/upload">
                        <Sparkles className="w-5 h-5 mr-2" />
                        Create Your Own Recap
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center mt-8"
            >
              <p className="text-sm text-muted-foreground">
                Powered by{" "}
                <Link href="/" className="text-primary hover:underline">
                  Rift Rewind
                </Link>
              </p>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
