"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Bell, Eye, Trash2, Download, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [publicProfile, setPublicProfile] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleExportData = () => {
    // Mock export functionality
    const data = {
      profile: { name: "Summoner", region: "NA1" },
      stats: { games: 150, winRate: 52.3 },
      exportDate: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "rift-rewind-data.json"
    a.click()
  }

  const handleDeleteData = () => {
    // Mock delete functionality
    console.log("[v0] Deleting user data...")
    setShowDeleteConfirm(false)
    // In production, this would call an API endpoint
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="glass-card">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your preferences and data</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="glass-card p-6">
              <h2 className="text-xl font-heading font-semibold mb-4 text-foreground">Appearance</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {darkMode ? (
                      <Moon className="h-5 w-5 text-cyan-400" />
                    ) : (
                      <Sun className="h-5 w-5 text-purple-400" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">Dark Mode</p>
                      <p className="text-sm text-muted-foreground">Use dark theme across the app</p>
                    </div>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-cyan-400" />
                    <div>
                      <p className="font-medium text-foreground">Reduced Motion</p>
                      <p className="text-sm text-muted-foreground">Minimize animations for accessibility</p>
                    </div>
                  </div>
                  <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Privacy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="glass-card p-6">
              <h2 className="text-xl font-heading font-semibold mb-4 text-foreground">Privacy</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="font-medium text-foreground">Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive updates about new features</p>
                    </div>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="font-medium text-foreground">Public Profile</p>
                      <p className="text-sm text-muted-foreground">Allow others to view your stats</p>
                    </div>
                  </div>
                  <Switch checked={publicProfile} onCheckedChange={setPublicProfile} />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Data Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="glass-card p-6">
              <h2 className="text-xl font-heading font-semibold mb-4 text-foreground">Data Management</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Download className="h-5 w-5 text-cyan-400" />
                    <div>
                      <p className="font-medium text-foreground">Export Data</p>
                      <p className="text-sm text-muted-foreground">Download your stats as JSON</p>
                    </div>
                  </div>
                  <Button onClick={handleExportData} variant="outline" size="sm">
                    Export
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trash2 className="h-5 w-5 text-red-400" />
                    <div>
                      <p className="font-medium text-foreground">Delete Data</p>
                      <p className="text-sm text-muted-foreground">Permanently remove your information</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    variant="outline"
                    size="sm"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {showDeleteConfirm && (
                <Alert className="mt-4 border-red-500/50 bg-red-500/10">
                  <AlertDescription className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Are you sure? This action cannot be undone.</span>
                    <div className="flex gap-2">
                      <Button onClick={() => setShowDeleteConfirm(false)} variant="ghost" size="sm">
                        Cancel
                      </Button>
                      <Button onClick={handleDeleteData} variant="destructive" size="sm">
                        Confirm Delete
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </Card>
          </motion.div>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="glass-card p-6">
              <h2 className="text-xl font-heading font-semibold mb-4 text-foreground">Legal</h2>
              <div className="space-y-2">
                <Link href="/privacy" className="block text-cyan-400 hover:text-cyan-300 transition-colors">
                  Privacy Policy
                </Link>
                <p className="text-sm text-muted-foreground">
                  Rift Rewind is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or
                  anyone officially involved in producing or managing Riot Games properties.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
