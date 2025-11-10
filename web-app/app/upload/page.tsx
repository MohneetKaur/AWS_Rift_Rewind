"use client"

import type React from "react"

import { useState, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, Shield, TrendingUp, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"

function UploadContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isSample = searchParams.get("sample") === "true"

  const [step, setStep] = useState<"input" | "fetching" | "analyzing" | "complete">("input")
  const [riotId, setRiotId] = useState("")
  const [tagline, setTagline] = useState("")
  const [region, setRegion] = useState("na1")
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!isSample && (!riotId || !tagline)) {
      setError("Please enter your Riot ID and tagline")
      return
    }

    // Simulate the fetch process
    setStep("fetching")
    setProgress(10)

    await new Promise((resolve) => setTimeout(resolve, 1500))
    setProgress(40)
    setStep("analyzing")

    await new Promise((resolve) => setTimeout(resolve, 2000))
    setProgress(80)

    await new Promise((resolve) => setTimeout(resolve, 1000))
    setProgress(100)
    setStep("complete")

    // Redirect to player dashboard - using Faker's real PUUID from S3 data
    setTimeout(() => {
      const fakerPuuid = "-xcGtW5IiRCa5zoyKayq8FnDuyXKaZ4j3bGhzlnFTFCaN6pbXVwR8VrGwILuGMuQRFvQw5_hrhygyA"
      router.push(`/player/${fakerPuuid}`)
    }, 1500)
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
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {isSample ? "Try Sample Data" : "Connect Your Account"}
              </h1>
              <p className="text-lg text-muted-foreground">
                {isSample
                  ? "Experience Rift Rewind with sample data"
                  : "Enter your Riot ID to generate your personalized recap"}
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              {step === "input" && (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="glass neon-glow p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {!isSample && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="riotId">Riot ID</Label>
                            <Input
                              id="riotId"
                              placeholder="Summoner Name"
                              value={riotId}
                              onChange={(e) => setRiotId(e.target.value)}
                              className="bg-input/50"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="tagline">Tagline</Label>
                            <Input
                              id="tagline"
                              placeholder="NA1"
                              value={tagline}
                              onChange={(e) => setTagline(e.target.value)}
                              className="bg-input/50"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="region">Region</Label>
                            <select
                              id="region"
                              value={region}
                              onChange={(e) => setRegion(e.target.value)}
                              className="w-full px-3 py-2 bg-input/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                              <option value="na1">North America</option>
                              <option value="euw1">Europe West</option>
                              <option value="eun1">Europe Nordic & East</option>
                              <option value="kr">Korea</option>
                              <option value="br1">Brazil</option>
                              <option value="la1">Latin America North</option>
                              <option value="la2">Latin America South</option>
                              <option value="oc1">Oceania</option>
                              <option value="tr1">Turkey</option>
                              <option value="ru">Russia</option>
                              <option value="jp1">Japan</option>
                            </select>
                          </div>
                        </>
                      )}

                      {error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <Alert className="bg-primary/10 border-primary/20">
                        <Shield className="h-4 w-4 text-primary" />
                        <AlertDescription className="text-foreground">
                          Your data is processed securely and never stored permanently. We only fetch publicly available
                          match data from Riot's API.
                        </AlertDescription>
                      </Alert>

                      <Button type="submit" size="lg" className="w-full neon-glow">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        {isSample ? "Load Sample Data" : "Generate My Recap"}
                      </Button>
                    </form>
                  </Card>
                </motion.div>
              )}

              {(step === "fetching" || step === "analyzing" || step === "complete") && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="glass neon-glow p-8">
                    <div className="space-y-6">
                      <div className="text-center space-y-4">
                        {step === "complete" ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                          >
                            <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
                          </motion.div>
                        ) : (
                          <Loader2 className="w-16 h-16 text-primary mx-auto animate-spin" />
                        )}

                        <div>
                          <h2 className="text-2xl font-bold mb-2">
                            {step === "fetching" && "Fetching Your Data"}
                            {step === "analyzing" && "Analyzing Your Games"}
                            {step === "complete" && "Recap Ready!"}
                          </h2>
                          <p className="text-muted-foreground">
                            {step === "fetching" && "Connecting to Riot API..."}
                            {step === "analyzing" && "Computing insights and trends..."}
                            {step === "complete" && "Redirecting to your dashboard..."}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span>Account verified</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2
                            className={`w-4 h-4 ${step === "analyzing" || step === "complete" ? "text-primary" : "text-muted"}`}
                          />
                          <span>Match history retrieved</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className={`w-4 h-4 ${step === "complete" ? "text-primary" : "text-muted"}`} />
                          <span>Insights generated</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  )
}

export default function UploadPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <UploadContent />
    </Suspense>
  )
}
