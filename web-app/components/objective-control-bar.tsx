"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface ObjectiveControlData {
  patch: string
  dragons: number
  heralds: number
  barons: number
}

interface ObjectiveControlBarProps {
  data: ObjectiveControlData[]
}

export function ObjectiveControlBar({ data }: ObjectiveControlBarProps) {
  return (
    <Card className="glass p-6">
      <h2 className="text-2xl font-bold mb-6">Objective Control by Patch</h2>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-[400px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 264 / 0.3)" />
            <XAxis dataKey="patch" tick={{ fill: "oklch(0.98 0.01 264)", fontSize: 12 }} />
            <YAxis tick={{ fill: "oklch(0.98 0.01 264)", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.1 0.02 264 / 0.95)",
                border: "1px solid oklch(0.25 0.03 264 / 0.3)",
                borderRadius: "0.5rem",
                color: "oklch(0.98 0.01 264)",
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ color: "oklch(0.98 0.01 264)" }}
            />
            <Bar dataKey="dragons" stackId="a" fill="oklch(0.7 0.2 195)" name="Dragons" />
            <Bar dataKey="heralds" stackId="a" fill="oklch(0.65 0.25 300)" name="Heralds" />
            <Bar dataKey="barons" stackId="a" fill="oklch(0.75 0.18 240)" name="Barons" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </Card>
  )
}
