"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Shield, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function PrivacyPage() {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteData = () => {
    setIsDeleting(true)
    // Simulate deletion
    setTimeout(() => {
      alert("Your data has been deleted successfully")
      setIsDeleting(false)
    }, 2000)
  }

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
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-8 h-8 text-primary" />
                <h1 className="text-4xl font-bold">Privacy Policy</h1>
              </div>
              <p className="text-lg text-muted-foreground">How we handle your data</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <Card className="glass p-6">
                <h2 className="text-2xl font-bold mb-4">Data Collection</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>Rift Rewind collects only publicly available data from Riot Games' API, including:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Match history and game statistics</li>
                    <li>Champion mastery and performance metrics</li>
                    <li>Rank and league information</li>
                    <li>Challenge progress and achievements</li>
                  </ul>
                </div>
              </Card>

              <Card className="glass p-6">
                <h2 className="text-2xl font-bold mb-4">Data Storage</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Your data is processed in real-time and cached temporarily to improve performance. We do not
                    permanently store your personal information or match data.
                  </p>
                  <p>Session data is automatically cleared after 24 hours of inactivity.</p>
                </div>
              </Card>

              <Card className="glass p-6">
                <h2 className="text-2xl font-bold mb-4">Data Usage</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>We use your data solely to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Generate your personalized year-in-review recap</li>
                    <li>Provide AI-powered insights and coaching tips</li>
                    <li>Create shareable recap cards</li>
                    <li>Compare statistics with friends (with your permission)</li>
                  </ul>
                  <p className="mt-4">We never sell your data to third parties.</p>
                </div>
              </Card>

              <Card className="glass p-6">
                <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    You have the right to request deletion of your data at any time. Click the button below to
                    permanently remove all cached data associated with your account.
                  </p>
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={handleDeleteData}
                    disabled={isDeleting}
                    className="w-full md:w-auto"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    {isDeleting ? "Deleting..." : "Delete My Data"}
                  </Button>
                </div>
              </Card>

              <Card className="glass p-6">
                <h2 className="text-2xl font-bold mb-4">Contact</h2>
                <p className="text-muted-foreground">
                  If you have questions about our privacy practices, please contact us at{" "}
                  <a href="mailto:privacy@leaguerecap.gg" className="text-primary hover:underline">
                    privacy@leaguerecap.gg
                  </a>
                </p>
              </Card>

              <div className="text-center text-sm text-muted-foreground">
                <p>Last updated: January 2025</p>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
