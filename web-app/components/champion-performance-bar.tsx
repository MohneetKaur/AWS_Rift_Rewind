"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface ChampionPerformance {
  champion: string
  games: number
  winRate: number
  kda: number
}

interface ChampionPerformanceBarProps {
  data: ChampionPerformance[]
}

export function ChampionPerformanceBar({ data }: ChampionPerformanceBarProps) {
  const sortedData = [...data].sort((a, b) => b.games - a.games).slice(0, 10)

  const getBarColor = (winRate: number) => {
    if (winRate >= 60) return "oklch(0.7 0.2 195)"
    if (winRate >= 50) return "oklch(0.75 0.18 240)"
    if (winRate >= 45) return "oklch(0.6 0.15 264)"
    return "oklch(0.65 0.25 300)"
  }

  return (
    <Card className="glass p-6">
      <h2 className="text-2xl font-bold mb-6">Top Champions by Games</h2>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-[500px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData} layout="vertical" margin={{ left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 264 / 0.3)" />
            <XAxis type="number" tick={{ fill: "oklch(0.98 0.01 264)", fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="champion"
              tick={{ fill: "oklch(0.98 0.01 264)", fontSize: 12 }}
              width={70}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.1 0.02 264 / 0.95)",
                border: "1px solid oklch(0.25 0.03 264 / 0.3)",
                borderRadius: "0.5rem",
                color: "oklch(0.98 0.01 264)",
              }}
              formatter={(value: number, name: string, props: any) => [
                `${value} games | ${props.payload.winRate}% WR | ${props.payload.kda} KDA`,
                props.payload.champion,
              ]}
            />
            <Bar dataKey="games" radius={[0, 4, 4, 0]}>
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.winRate)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </Card>
  )
}
