"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface RoleData {
  role: string
  games: number
  winRate: number
}

interface RoleDistributionProps {
  data: RoleData[]
}

const ROLE_COLORS = {
  Top: "oklch(0.7 0.2 195)",
  Jungle: "oklch(0.65 0.25 300)",
  Mid: "oklch(0.75 0.18 240)",
  ADC: "oklch(0.6 0.22 320)",
  Support: "oklch(0.68 0.20 160)",
}

export function RoleDistribution({ data }: RoleDistributionProps) {
  const chartData = data.map((item) => ({
    name: item.role,
    value: item.games,
    winRate: item.winRate,
    color: ROLE_COLORS[item.role as keyof typeof ROLE_COLORS] || "oklch(0.6 0.15 264)",
  }))

  return (
    <Card className="glass p-6">
      <h2 className="text-2xl font-bold mb-6">Role Distribution</h2>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="h-[500px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={140}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>

            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ color: "oklch(0.98 0.01 264)" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="glass-strong rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Primary Role</p>
          <p className="text-2xl font-bold text-primary">{data[0]?.role || "N/A"}</p>
        </div>
        <div className="glass-strong rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Role Flexibility</p>
          <p className="text-2xl font-bold text-secondary">{data.length} roles</p>
        </div>
      </div>
    </Card>
  )
}
