"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { LineChart, Line, ResponsiveContainer } from "recharts"

interface KpiData {
  label: string
  value: string
  change: number
  sparkline: number[]
}

interface KpiStripProps {
  kpis: KpiData[]
}

export function KpiStrip({ kpis }: KpiStripProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, index) => {
        const sparklineData = kpi.sparkline.map((value, i) => ({ value, index: i }))
        const isPositive = kpi.change > 0
        const isNeutral = kpi.change === 0

        return (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            <Card className="glass p-4 hover:neon-glow transition-all duration-300">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{kpi.label}</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <div
                    className={`flex items-center gap-1 text-xs font-medium ${
                      isPositive ? "text-primary" : isNeutral ? "text-muted-foreground" : "text-destructive"
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : isNeutral ? (
                      <Minus className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(kpi.change)}
                  </div>
                </div>
                <div className="h-8 -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={isPositive ? "oklch(0.7 0.2 195)" : "oklch(0.65 0.25 300)"}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
