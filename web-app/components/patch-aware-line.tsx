"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

interface PatchData {
  patch: string
  winRate: number
  kda: number
  games: number
}

interface PatchAwareLineProps {
  data: PatchData[]
}

export function PatchAwareLine({ data }: PatchAwareLineProps) {
  return (
    <Card className="glass p-6">
      <h2 className="text-2xl font-bold mb-6">Patch Trends</h2>

      <Tabs defaultValue="winrate" className="space-y-4">
        <TabsList className="glass">
          <TabsTrigger value="winrate">Win Rate</TabsTrigger>
          <TabsTrigger value="kda">KDA</TabsTrigger>
        </TabsList>

        <TabsContent value="winrate">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 264 / 0.3)" />
                <XAxis dataKey="patch" tick={{ fill: "oklch(0.98 0.01 264)", fontSize: 12 }} />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "oklch(0.98 0.01 264)", fontSize: 12 }}
                  label={{ value: "Win Rate %", angle: -90, position: "insideLeft", fill: "oklch(0.6 0.01 264)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.1 0.02 264 / 0.95)",
                    border: "1px solid oklch(0.25 0.03 264 / 0.3)",
                    borderRadius: "0.5rem",
                    color: "oklch(0.98 0.01 264)",
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, "Win Rate"]}
                />
                <ReferenceLine y={50} stroke="oklch(0.6 0.01 264)" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="winRate"
                  stroke="oklch(0.7 0.2 195)"
                  strokeWidth={3}
                  dot={{ fill: "oklch(0.7 0.2 195)", r: 4 }}
                  activeDot={{ r: 6, fill: "oklch(0.7 0.2 195)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </TabsContent>

        <TabsContent value="kda">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 264 / 0.3)" />
                <XAxis dataKey="patch" tick={{ fill: "oklch(0.98 0.01 264)", fontSize: 12 }} />
                <YAxis
                  domain={[0, 6]}
                  tick={{ fill: "oklch(0.98 0.01 264)", fontSize: 12 }}
                  label={{ value: "KDA", angle: -90, position: "insideLeft", fill: "oklch(0.6 0.01 264)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.1 0.02 264 / 0.95)",
                    border: "1px solid oklch(0.25 0.03 264 / 0.3)",
                    borderRadius: "0.5rem",
                    color: "oklch(0.98 0.01 264)",
                  }}
                  formatter={(value: number) => [value.toFixed(2), "KDA"]}
                />
                <ReferenceLine y={3} stroke="oklch(0.6 0.01 264)" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="kda"
                  stroke="oklch(0.65 0.25 300)"
                  strokeWidth={3}
                  dot={{ fill: "oklch(0.65 0.25 300)", r: 4 }}
                  activeDot={{ r: 6, fill: "oklch(0.65 0.25 300)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
