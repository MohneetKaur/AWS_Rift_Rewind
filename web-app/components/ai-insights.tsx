"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Lightbulb, Target, UsersIcon, Sparkles, RefreshCw } from "lucide-react"
import { useState } from "react"

interface Insight {
  type: "macro" | "micro" | "draft"
  title: string
  description: string
  evidence: string
}

interface AIInsightsProps {
  insights: Insight[]
}

const iconMap = {
  macro: Target,
  micro: Sparkles,
  draft: UsersIcon,
}

const colorMap = {
  macro: "text-primary",
  micro: "text-secondary",
  draft: "text-chart-3",
}

export function AIInsights({ insights }: AIInsightsProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleRegenerate = () => {
    setIsGenerating(true)
    setTimeout(() => setIsGenerating(false), 2000)
  }

  return (
    <Card className="glass p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">AI Coach</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRegenerate}
          disabled={isGenerating}
          className="bg-transparent"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
          Regenerate
        </Button>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = iconMap[insight.type]

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="glass-strong rounded-lg p-4 hover:neon-glow transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div className={`${colorMap[insight.type]} mt-1`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs uppercase">
                        {insight.type}
                      </Badge>
                      <h3 className="font-bold">{insight.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                    <p className="text-xs text-muted-foreground italic">Evidence: {insight.evidence}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </Card>
  )
}
