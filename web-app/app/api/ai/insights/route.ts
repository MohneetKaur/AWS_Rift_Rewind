import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { stats, category } = await request.json()

    const prompts = {
      macro: `Analyze this League of Legends player's macro gameplay: ${JSON.stringify(stats)}. Provide 2-3 actionable insights about map awareness, objective control, and rotations.`,
      micro: `Analyze this League of Legends player's micro mechanics: ${JSON.stringify(stats)}. Provide 2-3 actionable insights about CS, trading, and teamfighting.`,
      draft: `Analyze this League of Legends player's champion pool: ${JSON.stringify(stats)}. Provide 2-3 actionable insights about champion diversity, meta picks, and counterpicks.`,
    }

    const { text } = await generateText({
      model: "anthropic/claude-sonnet-4",
      prompt: prompts[category as keyof typeof prompts] || prompts.macro,
      maxTokens: 200,
    })

    return NextResponse.json({ insight: text })
  } catch (error) {
    console.error("[v0] AI insights error:", error)
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}
