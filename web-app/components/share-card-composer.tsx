"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Share2, Copy, Check } from "lucide-react"
import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ShareCardComposerProps {
  player: {
    summonerName: string
    tagline: string
    tier: string
    rank: string
  }
  stats: {
    winRate: string
    kda: string
    games: number
    topChampion: string
  }
}

export function ShareCardComposer({ player, stats }: ShareCardComposerProps) {
  const [preset, setPreset] = useState<"story" | "square">("story")
  const [theme, setTheme] = useState<"cyan" | "purple" | "gradient">("cyan")
  const [copied, setCopied] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleExport = () => {
    // In a real implementation, this would use html2canvas or similar
    alert("Export functionality would capture the card as PNG")
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = (platform: "twitter" | "discord") => {
    const url = window.location.href
    const text = `Check out my Rift Rewind! ${stats.winRate} WR, ${stats.kda} KDA`

    if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`)
    } else {
      // Discord doesn't have a direct share URL, so we just copy
      navigator.clipboard.writeText(`${text}\n${url}`)
      alert("Link copied! Paste it in Discord.")
    }
  }

  const themeColors = {
    cyan: "from-primary/20 to-primary/5",
    purple: "from-secondary/20 to-secondary/5",
    gradient: "from-primary/20 via-secondary/20 to-primary/5",
  }

  const dimensions = preset === "story" ? "aspect-[9/16]" : "aspect-square"

  return (
    <Card className="glass p-6">
      <h2 className="text-2xl font-bold mb-6">Share Your Recap</h2>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Preview */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={preset === "story" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreset("story")}
              className={preset === "story" ? "neon-glow" : "bg-transparent"}
            >
              Story (9:16)
            </Button>
            <Button
              variant={preset === "square" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreset("square")}
              className={preset === "square" ? "neon-glow" : "bg-transparent"}
            >
              Square (1:1)
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant={theme === "cyan" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("cyan")}
              className={theme === "cyan" ? "neon-glow" : "bg-transparent"}
            >
              Cyan
            </Button>
            <Button
              variant={theme === "purple" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("purple")}
              className={theme === "purple" ? "neon-glow-purple" : "bg-transparent"}
            >
              Purple
            </Button>
            <Button
              variant={theme === "gradient" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("gradient")}
              className={theme === "gradient" ? "neon-glow" : "bg-transparent"}
            >
              Gradient
            </Button>
          </div>

          <motion.div
            key={`${preset}-${theme}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md mx-auto"
          >
            <div
              ref={cardRef}
              className={`${dimensions} w-full glass-strong rounded-lg overflow-hidden relative bg-gradient-to-br ${themeColors[theme]}`}
            >
              <div className="absolute inset-0 flex flex-col justify-between p-8">
                {/* Header */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-16 h-16 border-4 border-primary/50">
                      <AvatarImage
                        src={`/placeholder.svg?height=64&width=64&query=league+profile`}
                        alt={player.summonerName}
                      />
                      <AvatarFallback>{player.summonerName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold">
                        {player.summonerName}
                        <span className="text-muted-foreground">#{player.tagline}</span>
                      </h3>
                      <p className="text-sm text-primary font-semibold">
                        {player.tier} {player.rank}
                      </p>
                    </div>
                  </div>

                  <div className="glass-strong rounded-lg p-4">
                    <h4 className="text-sm text-muted-foreground mb-3">Season Highlights</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-2xl font-bold text-primary">{stats.winRate}</p>
                        <p className="text-xs text-muted-foreground">Win Rate</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-secondary">{stats.kda}</p>
                        <p className="text-xs text-muted-foreground">KDA</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.games}</p>
                        <p className="text-xs text-muted-foreground">Games</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">{stats.topChampion}</p>
                        <p className="text-xs text-muted-foreground">Top Pick</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                      <span className="text-xs">⚡</span>
                    </div>
                    <span className="text-sm font-medium">Rift Rewind 2025</span>
                  </div>
                  <p className="text-xs text-muted-foreground">riftrewind.gg</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="glass-strong rounded-lg p-6 space-y-4">
            <h3 className="font-bold mb-4">Export Options</h3>

            <Button onClick={handleExport} className="w-full neon-glow" size="lg">
              <Download className="w-5 h-5 mr-2" />
              Download PNG
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or share directly</span>
              </div>
            </div>

            <Button onClick={handleCopyLink} variant="outline" className="w-full bg-transparent" size="lg">
              {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
              {copied ? "Copied!" : "Copy Link"}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => handleShare("twitter")} variant="outline" className="bg-transparent">
                <Share2 className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button onClick={() => handleShare("discord")} variant="outline" className="bg-transparent">
                <Share2 className="w-4 h-4 mr-2" />
                Discord
              </Button>
            </div>
          </div>

          <div className="glass-strong rounded-lg p-6">
            <h3 className="font-bold mb-2">Tips</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Story format is perfect for Instagram and Snapchat</li>
              <li>• Square format works best for Twitter and Discord</li>
              <li>• Choose a theme that matches your vibe</li>
              <li>• Watermark is automatically added</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  )
}
