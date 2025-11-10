"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronRight } from "lucide-react"

interface Match {
  id: string
  champion: string
  result: "win" | "loss"
  kda: string
  cs: number
  duration: string
  tags: string[]
}

interface MatchListProps {
  matches: Match[]
}

export function MatchList({ matches }: MatchListProps) {
  return (
    <Card className="glass p-6">
      <h2 className="text-2xl font-bold mb-6">Recent Matches</h2>

      <div className="space-y-3">
        {matches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group"
          >
            <div
              className={`glass-strong rounded-lg p-4 flex items-center gap-4 cursor-pointer hover:neon-glow transition-all duration-300 border-l-4 ${
                match.result === "win" ? "border-l-primary" : "border-l-destructive"
              }`}
            >
              {/* Champion Icon */}
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${match.champion}.png`}
                  alt={match.champion}
                  className="w-10 h-10 rounded"
                  onError={(e) => {
                    // Fallback to a default champion icon if the champion image fails to load
                    e.currentTarget.src = "https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/Aatrox.png"
                  }}
                />
              </div>

              {/* Match Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold">{match.champion}</p>
                  <span
                    className={`text-xs font-semibold uppercase ${
                      match.result === "win" ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {match.result}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="font-mono">{match.kda}</span>
                  <span>{match.cs} CS</span>
                  <span>{match.duration}</span>
                </div>
                {match.tags.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {match.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Arrow */}
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </div>
          </motion.div>
        ))}
      </div>

      {matches.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No matches yet—borrow a minion wave with sample data</p>
        </div>
      )}
    </Card>
  )
}
