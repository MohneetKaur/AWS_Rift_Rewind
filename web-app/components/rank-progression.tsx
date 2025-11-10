"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { TrendingUp, Activity } from "lucide-react"
import { useState } from "react"

interface RankData {
  date: string
  lp: number
  tier: string
  rank: string
  wins?: number
  losses?: number
  winRate?: number
  gamesThisWeek?: number
}

interface PatchData {
  patch: string
  winRate: number
  kda: number
  games: number
}

interface RankProgressionProps {
  data: RankData[]
  patchData?: PatchData[]
}

const TIER_THRESHOLDS = {
  "IRON IV": 0,
  "IRON III": 100,
  "IRON II": 200,
  "IRON I": 300,
  "BRONZE IV": 400,
  "BRONZE III": 500,
  "BRONZE II": 600,
  "BRONZE I": 700,
  "SILVER IV": 800,
  "SILVER III": 900,
  "SILVER II": 1000,
  "SILVER I": 1100,
  "GOLD IV": 1200,
  "GOLD III": 1300,
  "GOLD II": 1400,
  "GOLD I": 1500,
  "PLATINUM IV": 1600,
  "PLATINUM III": 1700,
  "PLATINUM II": 1800,
  "PLATINUM I": 1900,
  "DIAMOND IV": 2000,
  "DIAMOND III": 2100,
  "DIAMOND II": 2200,
  "DIAMOND I": 2300,
}

export function RankProgression({ data, patchData = [] }: RankProgressionProps) {
  const [viewMode, setViewMode] = useState<'timeline' | 'patches'>('timeline')
  
  const chartData = data.map((item) => ({
    date: item.date,
    lp: item.lp,
    wins: item.wins || 0,
    losses: item.losses || 0,
    winRate: item.winRate || 0,
    gamesThisWeek: item.gamesThisWeek || 0,
    label: `${item.tier} ${item.rank}`,
  }))

  const minLP = Math.min(...chartData.map((d) => d.lp))
  const maxLP = Math.max(...chartData.map((d) => d.lp))
  const lpGain = maxLP - minLP

  return (
    <Card className="glass p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            {viewMode === 'timeline' ? 'Performance Timeline' : 'Patch Performance Trends'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {viewMode === 'timeline' 
              ? 'Cumulative win rate progression over time' 
              : 'Win rate performance across different game patches'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('timeline')}
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Timeline
          </Button>
          <Button
            variant={viewMode === 'patches' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('patches')}
            className="flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Patches
          </Button>
        </div>
      </div>
      <motion.div
        key={viewMode}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="h-[450px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'timeline' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 264 / 0.3)" />
              <XAxis
                dataKey="date"
                tick={{ fill: "oklch(0.98 0.01 264)", fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                label={{ value: "Time Period (Weekly)", position: "insideBottom", offset: -5, fill: "oklch(0.6 0.01 264)" }}
              />
              <YAxis
                tick={{ fill: "oklch(0.98 0.01 264)", fontSize: 12 }}
                domain={[0, 100]}
                label={{ value: "Cumulative Win Rate (%)", angle: -90, position: "insideLeft", fill: "oklch(0.6 0.01 264)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.1 0.02 264 / 0.95)",
                  border: "1px solid oklch(0.25 0.03 264 / 0.3)",
                  borderRadius: "0.5rem",
                  color: "oklch(0.98 0.01 264)",
                }}
                formatter={(value: number, name: string, props: any) => [
                  `${props.payload?.winRate?.toFixed(1) || value}% Overall Win Rate`,
                  `Total Games: ${props.payload?.wins || 0}W ${props.payload?.losses || 0}L`,
                  `Games this week: ${props.payload?.gamesThisWeek || 0}`
                ]}
                labelFormatter={(label) =>
                  `Week of ${new Date(label).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                }
              />
              <ReferenceLine y={50} stroke="oklch(0.6 0.01 264)" strokeDasharray="3 3" />
              <Line
                type="stepAfter"
                dataKey="lp"
                stroke="oklch(0.7 0.2 195)"
                strokeWidth={3}
                dot={{ fill: "oklch(0.7 0.2 195)", r: 4 }}
                activeDot={{ r: 6, fill: "oklch(0.7 0.2 195)" }}
              />
            </LineChart>
          ) : (
            <LineChart data={patchData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 264 / 0.3)" />
              <XAxis
                dataKey="patch"
                tick={{ fill: "oklch(0.98 0.01 264)", fontSize: 12 }}
                label={{ value: "Game Patch Version", position: "insideBottom", offset: -5, fill: "oklch(0.6 0.01 264)" }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "oklch(0.98 0.01 264)", fontSize: 12 }}
                label={{ value: "Patch-Specific Win Rate (%)", angle: -90, position: "insideLeft", fill: "oklch(0.6 0.01 264)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.1 0.02 264 / 0.95)",
                  border: "1px solid oklch(0.25 0.03 264 / 0.3)",
                  borderRadius: "0.5rem",
                  color: "oklch(0.98 0.01 264)",
                }}
                formatter={(value: number, name: string, props: any) => [
                  `${value.toFixed(1)}% Win Rate on this patch`,
                  `KDA: ${props.payload?.kda?.toFixed(2) || 'N/A'}`,
                  `Games played: ${props.payload?.games || 0}`
                ]}
                labelFormatter={(label) => `Patch ${label}`}
              />
              <ReferenceLine y={50} stroke="oklch(0.6 0.01 264)" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="winRate"
                stroke="oklch(0.65 0.25 300)"
                strokeWidth={3}
                dot={{ fill: "oklch(0.65 0.25 300)", r: 4 }}
                activeDot={{ r: 6, fill: "oklch(0.65 0.25 300)" }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        {viewMode === 'timeline' ? (
          <>
            <div className="glass-strong rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Total Games Tracked</p>
              <p className="text-lg font-bold text-primary">
                {data.length > 0 ? ((data[data.length - 1]?.wins || 0) + (data[data.length - 1]?.losses || 0)) : 0}
              </p>
            </div>
            <div className="glass-strong rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Current Win Rate</p>
              <p className="text-lg font-bold text-secondary">
                {data.length > 0 ? (data[data.length - 1]?.winRate || 0).toFixed(1) : 0}%
              </p>
            </div>
            <div className="glass-strong rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Improvement</p>
              <p className="text-lg font-bold text-primary">
                {data.length > 1 ? 
                  `${((data[data.length - 1]?.winRate || 0) - (data[0]?.winRate || 0)) > 0 ? '+' : ''}${((data[data.length - 1]?.winRate || 0) - (data[0]?.winRate || 0)).toFixed(1)}%` 
                  : "N/A"
                }
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="glass-strong rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Patches Analyzed</p>
              <p className="text-lg font-bold text-primary">
                {patchData.length}
              </p>
            </div>
            <div className="glass-strong rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Best Patch WR</p>
              <p className="text-lg font-bold text-secondary">
                {patchData.length > 0 ? Math.max(...patchData.map(p => p.winRate)).toFixed(1) : 0}%
              </p>
            </div>
            <div className="glass-strong rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Patch Variance</p>
              <p className="text-lg font-bold text-primary">
                {patchData.length > 1 ? 
                  `${(Math.max(...patchData.map(p => p.winRate)) - Math.min(...patchData.map(p => p.winRate))).toFixed(1)}%` 
                  : "N/A"
                }
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
