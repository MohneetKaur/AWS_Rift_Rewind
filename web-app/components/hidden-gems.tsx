"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

interface HiddenGem {
  strength: string
  evidence: string
}

interface HiddenGemsProps {
  gems: HiddenGem[]
}

export function HiddenGems({ gems }: HiddenGemsProps) {
  return (
    <Card className="glass p-6">
      <div className="flex items-center gap-2 mb-6">
        <Star className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Hidden Strengths</h2>
      </div>

      <div className="space-y-4">
        {gems.map((gem, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="glass-strong rounded-lg p-4 border-l-4 border-l-primary">
              <div className="flex items-start gap-3">
                <Star className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-bold text-primary">{gem.strength}</p>
                  <p className="text-sm text-muted-foreground">{gem.evidence}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}
