"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, Plus, X, Users } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Player {
  id: string
  name: string
  tagline: string
  winRate: number
  kda: number
  games: number
}

const samplePlayers: Player[] = [
  { id: "1", name: "Faker", tagline: "T1", winRate: 53.4, kda: 3.2, games: 640 },
  { id: "2", name: "Chovy", tagline: "GEN", winRate: 55.8, kda: 3.8, games: 582 },
]

export default function ComparePage() {
  const [players, setPlayers] = useState<Player[]>(samplePlayers)
  const [searchQuery, setSearchQuery] = useState("")

  const handleAddPlayer = () => {
    if (players.length < 4) {
      // Simulate adding a player
      const newPlayer: Player = {
        id: String(players.length + 1),
        name: "Player" + (players.length + 1),
        tagline: "NA1",
        winRate: 50 + Math.random() * 10,
        kda: 2.5 + Math.random() * 1.5,
        games: 400 + Math.floor(Math.random() * 300),
      }
      setPlayers([...players, newPlayer])
    }
  }

  const handleRemovePlayer = (id: string) => {
    setPlayers(players.filter((p) => p.id !== id))
  }

  const metrics = [
    { label: "Win Rate", key: "winRate", format: (v: number) => `${v.toFixed(1)}%` },
    { label: "KDA", key: "kda", format: (v: number) => v.toFixed(2) },
    { label: "Games Played", key: "games", format: (v: number) => v.toString() },
  ]

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
              <Users className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold">Compare Players</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Add friends or duo partners to see how you stack up and discover synergies
            </p>
          </motion.div>

          {/* Add Player Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="glass p-6">
              <div className="flex gap-4">
                <Input
                  placeholder="Search summoner name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-input/50"
                />
                <Button onClick={handleAddPlayer} disabled={players.length >= 4} className="neon-glow">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Player
                </Button>
              </div>
              {players.length >= 4 && (
                <p className="text-sm text-muted-foreground mt-2">Maximum 4 players can be compared at once</p>
              )}
            </Card>
          </motion.div>

          {/* Player Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass p-6 relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemovePlayer(player.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>

                  <div className="flex flex-col items-center text-center space-y-4">
                    <Avatar className="w-20 h-20 border-4 border-primary/50">
                      <AvatarImage src={`/placeholder.svg?height=80&width=80&query=league+profile`} alt={player.name} />
                      <AvatarFallback>{player.name[0]}</AvatarFallback>
                    </Avatar>

                    <div>
                      <h3 className="font-bold text-lg">
                        {player.name}
                        <span className="text-muted-foreground">#{player.tagline}</span>
                      </h3>
                    </div>

                    <div className="w-full space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Win Rate</span>
                        <span className="font-bold text-primary">{player.winRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">KDA</span>
                        <span className="font-bold">{player.kda.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Games</span>
                        <span className="font-bold">{player.games}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Comparison Matrix */}
          {players.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <Card className="glass p-6">
                <h2 className="text-2xl font-bold mb-6">Head-to-Head Comparison</h2>

                <div className="space-y-6">
                  {metrics.map((metric) => {
                    const values = players.map((p) => p[metric.key as keyof Player] as number)
                    const maxValue = Math.max(...values)

                    return (
                      <div key={metric.key} className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                          {metric.label}
                        </h3>
                        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${players.length}, 1fr)` }}>
                          {players.map((player) => {
                            const value = player[metric.key as keyof Player] as number
                            const isMax = value === maxValue
                            const percentage = (value / maxValue) * 100

                            return (
                              <div key={player.id} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="truncate">{player.name}</span>
                                  <span className={`font-bold ${isMax ? "text-primary" : ""}`}>
                                    {metric.format(value)}
                                  </span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className={`h-full ${isMax ? "bg-primary" : "bg-secondary"}`}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Synergy Section */}
              <Card className="glass p-6">
                <h2 className="text-2xl font-bold mb-6">Duo Synergy</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {players.slice(0, 2).map((player, i) => (
                    <div key={player.id} className="glass-strong rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={`/placeholder.svg?height=40&width=40&query=league+profile`}
                            alt={player.name}
                          />
                          <AvatarFallback>{player.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-sm">{player.name}</p>
                          <p className="text-xs text-muted-foreground">Top 3 Synergies</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {["Leona", "Thresh", "Nautilus"].map((champ, j) => (
                          <div key={j} className="flex items-center justify-between text-sm">
                            <span>{champ}</span>
                            <Badge variant="secondary">{(65 - j * 3).toFixed(0)}% WR</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {players.length < 2 && (
            <Card className="glass p-12 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">Add at least 2 players to start comparing</p>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}
