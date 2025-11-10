"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, TrendingUp, Users, Zap } from "lucide-react"
import Link from "next/link"
import { PlayerSearch } from "@/components/player-search"

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,oklch(0.70_0.20_195_/_0.1),transparent_50%)]" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 glass-strong">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-xl font-heading font-bold text-gradient-cyan">Rift Rewind</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Button variant="ghost" asChild>
                <Link href="/upload">Get Started</Link>
              </Button>
            </motion.div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-5xl md:text-7xl font-bold text-balance mb-6">
                Your Year in <span className="text-gradient-cyan">League</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground text-balance">
                Discover your journey with AI-powered insights, stunning visualizations, and shareable year-in-review
                cards.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="neon-glow text-lg" asChild>
                <Link href="/search">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Search Any Player
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg bg-transparent" asChild>
                <Link href="/player/-xcGtW5IiRCa5zoyKayq8FnDuyXKaZ4j3bGhzlnFTFCaN6pbXVwR8VrGwILuGMuQRFvQw5_hrhygyA">View Faker's Dashboard</Link>
              </Button>
            </motion.div>

            {/* Player Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex justify-center"
            >
              <PlayerSearch />
            </motion.div>

            {/* Sample Card Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-16"
            >
              <Card className="glass neon-glow p-8 max-w-2xl mx-auto">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Sparkles className="w-12 h-12 text-primary mx-auto" />
                    <p className="text-muted-foreground">Your recap preview will appear here</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Value Props */}
        <section className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.1 }}
            className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {[
              {
                icon: TrendingUp,
                title: "AI-Powered Insights",
                description: "Get personalized coaching tips and discover hidden strengths in your gameplay.",
              },
              {
                icon: Zap,
                title: "Beautiful Visualizations",
                description: "Explore your stats with stunning charts, heatmaps, and performance radars.",
              },
              {
                icon: Users,
                title: "Compare & Share",
                description: "See how you stack up against friends and share your best moments.",
              },
            ].map((prop, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="glass p-6 h-full hover:neon-glow transition-all duration-300">
                  <prop.icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">{prop.title}</h3>
                  <p className="text-muted-foreground">{prop.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 glass-strong mt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Rift Rewind is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or
                anyone officially involved in producing or managing Riot Games properties.
              </p>
              <div className="flex gap-4">
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
