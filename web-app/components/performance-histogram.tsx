"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface HistogramData {
  range: string
  kills: number
  deaths: number
  assists: number
}

interface PerformanceHistogramProps {
  data: HistogramData[]
}

export function PerformanceHistogram({ data }: PerformanceHistogramProps) {
  return (
    <Card className="glass p-6">
      <h2 className="text-2xl font-bold mb-6">Performance Distribution</h2>

      <Tabs defaultValue="kills" className="space-y-4">
        <TabsList className="glass">
          <TabsTrigger value="kills">Kills</TabsTrigger>
          <TabsTrigger value="deaths">Deaths</TabsTrigger>
          <TabsTrigger value="assists">Assists</TabsTrigger>
        </TabsList>

        <TabsContent value="kills">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 264 / 0.3)" />
                <XAxis dataKey="range" tick={{ fill: "oklch(0.98 0.01 264)", fontSize: 12 }} />
                <YAxis
                  tick={{ fill: "oklch(0.98 0.01 264)", fontSize: 12 }}
                  label={{ value: "Games", angle: -90, position: "insideLeft", fill: "oklch(0.6 0.01 264)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.1 0.02 264 / 0.95)",
                    border: "1px solid oklch(0.25 0.03 264 / 0.3)",
                    borderRadius: "0.5rem",
                    color: "oklch(0.98 0.01 264)",
                  }}
                  formatter={(value: number) => [`${value} games`, "Frequency"]}
                />
                <Bar dataKey="kills" fill="oklch(0.7 0.2 195)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </TabsContent>

        <TabsContent value="deaths">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 264 / 0.3)" />
                <XAxis dataKey="range" tick={{ fill: "oklch(0.98 0.01 264)", fontSize: 12 }} />
                <YAxis
                  tick={{ fill: "oklch(0.98 0.01 264)", fontSize: 12 }}
                  label={{ value: "Games", angle: -90, position: "insideLeft", fill: "oklch(0.6 0.01 264)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.1 0.02 264 / 0.95)",
                    border: "1px solid oklch(0.25 0.03 264 / 0.3)",
                    borderRadius: "0.5rem",
                    color: "oklch(0.98 0.01 264)",
                  }}
                  formatter={(value: number) => [`${value} games`, "Frequency"]}
                />
                <Bar dataKey="deaths" fill="oklch(0.65 0.25 300)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </TabsContent>

        <TabsContent value="assists">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 264 / 0.3)" />
                <XAxis dataKey="range" tick={{ fill: "oklch(0.98 0.01 264)", fontSize: 12 }} />
                <YAxis
                  tick={{ fill: "oklch(0.98 0.01 264)", fontSize: 12 }}
                  label={{ value: "Games", angle: -90, position: "insideLeft", fill: "oklch(0.6 0.01 264)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.1 0.02 264 / 0.95)",
                    border: "1px solid oklch(0.25 0.03 264 / 0.3)",
                    borderRadius: "0.5rem",
                    color: "oklch(0.98 0.01 264)",
                  }}
                  formatter={(value: number) => [`${value} games`, "Frequency"]}
                />
                <Bar dataKey="assists" fill="oklch(0.75 0.18 240)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
