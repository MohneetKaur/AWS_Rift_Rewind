import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { stats, rating } = await request.json()

    const prompt =
      rating === "pg13"
        ? `Roast this League of Legends player's performance with witty, PG-13 humor: ${JSON.stringify(stats)}. Keep it playful and funny, 2-3 sentences max.`
        : `Gently tease this League of Legends player's performance with family-friendly humor: ${JSON.stringify(stats)}. Keep it lighthearted and encouraging, 2-3 sentences max.`

    const { text } = await generateText({
      model: "anthropic/claude-sonnet-4",
      prompt,
      maxTokens: 150,
    })

    return NextResponse.json({ roast: text })
  } catch (error) {
    console.error("[v0] AI roast error:", error)
    return NextResponse.json({ error: "Failed to generate roast" }, { status: 500 })
  }
}
