"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface ObjectiveData {
  name: string
  value: number
  color: string
  [key: string]: any
}

interface ObjectiveDonutProps {
  data: ObjectiveData[]
}

export function ObjectiveDonut({ data }: ObjectiveDonutProps) {
  return (
    <Card className="glass p-6">
      <h2 className="text-2xl font-bold mb-6">Objective Participation</h2>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="h-[500px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={140}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
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
          <p className="text-sm text-muted-foreground mb-1">First Objectives</p>
          <p className="text-2xl font-bold text-primary">24</p>
        </div>
        <div className="glass-strong rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Participation Rate</p>
          <p className="text-2xl font-bold text-secondary">68%</p>
        </div>
      </div>
    </Card>
  )
}
