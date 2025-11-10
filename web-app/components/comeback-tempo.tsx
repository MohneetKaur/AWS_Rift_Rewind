"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from "recharts"

interface TempoData {
  time: number
  goldDiff: number
}

interface ComebackTempoProps {
  data: TempoData[]
  matchId: string
  result: "win" | "loss"
}

export function ComebackTempo({ data, matchId, result }: ComebackTempoProps) {
  const isComeback = data.some((d, i) => i > 0 && data[i - 1].goldDiff < -3000 && d.goldDiff > 0)

  return (
    <Card className="glass p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Gold Difference Timeline</h2>
        {isComeback && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="px-3 py-1 rounded-full bg-primary/20 border border-primary text-primary text-sm font-bold"
          >
            Comeback!
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-[300px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="goldPositive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.7 0.2 195)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="oklch(0.7 0.2 195)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="goldNegative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.65 0.25 300)" stopOpacity={0} />
                <stop offset="95%" stopColor="oklch(0.65 0.25 300)" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 264 / 0.3)" />
            <XAxis
              dataKey="time"
              tick={{ fill: "oklch(0.98 0.01 264)", fontSize: 12 }}
              label={{ value: "Time (min)", position: "insideBottom", offset: -5, fill: "oklch(0.6 0.01 264)" }}
            />
            <YAxis
              tick={{ fill: "oklch(0.98 0.01 264)", fontSize: 12 }}
              label={{ value: "Gold Difference", angle: -90, position: "insideLeft", fill: "oklch(0.6 0.01 264)" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.1 0.02 264 / 0.95)",
                border: "1px solid oklch(0.25 0.03 264 / 0.3)",
                borderRadius: "0.5rem",
                color: "oklch(0.98 0.01 264)",
              }}
              formatter={(value: number) => [`${value > 0 ? "+" : ""}${value.toLocaleString()}g`, "Gold Diff"]}
              labelFormatter={(label) => `${label} min`}
            />
            <ReferenceLine y={0} stroke="oklch(0.6 0.01 264)" strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="goldDiff"
              stroke={result === "win" ? "oklch(0.7 0.2 195)" : "oklch(0.65 0.25 300)"}
              strokeWidth={3}
              fill="url(#goldPositive)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="glass-strong rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Max Lead</p>
          <p className="text-xl font-bold text-primary">
            +{Math.max(...data.map((d) => d.goldDiff)).toLocaleString()}g
          </p>
        </div>
        <div className="glass-strong rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Max Deficit</p>
          <p className="text-xl font-bold text-secondary">
            {Math.min(...data.map((d) => d.goldDiff)).toLocaleString()}g
          </p>
        </div>
        <div className="glass-strong rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Final</p>
          <p className="text-xl font-bold">
            {data[data.length - 1]?.goldDiff > 0 ? "+" : ""}
            {data[data.length - 1]?.goldDiff.toLocaleString()}g
          </p>
        </div>
      </div>
    </Card>
  )
}
