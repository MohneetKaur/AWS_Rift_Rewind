"use client"

import { motion } from "framer-motion"
import { PlayerSearch } from "@/components/player-search"
import { Sparkles, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SearchPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,oklch(0.70_0.20_195_/_0.1),transparent_50%)]" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 glass-strong">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-xl font-heading font-bold text-gradient-cyan">Rift Rewind</span>
            </Link>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </header>

        {/* Search Section */}
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Find Any <span className="text-gradient-cyan">Player</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Enter a Riot ID to view their League of Legends year in review dashboard
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center"
            >
              <PlayerSearch />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center space-y-4"
            >
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Players with full data available:</p>
                <div className="space-y-1">
                  <p><code className="bg-muted px-2 py-1 rounded">Hide on bush#KR1</code> (Faker - 185 matches)</p>
                  <p><code className="bg-muted px-2 py-1 rounded">Dôûblêlift#NA1</code> (Doublelift - Profile only)</p>
                </div>
                <p className="mt-2 text-xs">Try any other Riot ID for basic stats or demo data</p>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}