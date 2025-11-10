import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

// Configuration for different Claude models using inference profiles
export const CLAUDE_MODELS = {
  SONNET: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0', // Best for complex analysis
  HAIKU: 'us.anthropic.claude-3-haiku-20240307-v1:0',     // Faster, cheaper for simple tasks
} as const;

// Initialize Bedrock client
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export interface ClaudeResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

export interface BedrockInvokeParams {
  model?: keyof typeof CLAUDE_MODELS;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  userPrompt: string;
}

/**
 * Invoke Claude model through AWS Bedrock
 */
export async function invokeClaudeModel({
  model = 'SONNET',
  maxTokens = 4000,
  temperature = 0.7,
  systemPrompt,
  userPrompt
}: BedrockInvokeParams): Promise<string> {
  try {
    const modelId = CLAUDE_MODELS[model];
    
    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt
        }
      ]
    };

    const command = new InvokeModelCommand({
      modelId,
      body: JSON.stringify(payload),
      contentType: 'application/json',
      accept: 'application/json',
    });

    console.log(`🧠 Invoking Claude ${model} model...`);
    const response = await bedrockClient.send(command);
    
    if (!response.body) {
      throw new Error('No response body from Bedrock');
    }

    // Parse the response
    const responseBody = JSON.parse(new TextDecoder().decode(response.body)) as ClaudeResponse;
    
    if (!responseBody.content || responseBody.content.length === 0) {
      throw new Error('Invalid response format from Claude');
    }

    return responseBody.content[0].text;
    
  } catch (error) {
    console.error('❌ Error invoking Claude model:', error);
    throw new Error(`Bedrock invocation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Specialized function for League of Legends analysis
 */
export async function analyzeLeaguePerformance(
  playerData: any,
  analysisType: 'insights' | 'roast' | 'improvement' = 'insights'
): Promise<string> {
  const systemPrompts = {
    insights: `You are LS (Nick De Cesare) - the legendary League of Legends analyst known for unparalleled game knowledge and strategic insights. You've coached professional teams and have an encyclopedic understanding of:

- Advanced wave management and macro concepts that most players completely miss
- Champion interactions and power spikes at the highest level
- Professional meta evolution and why certain picks succeed or fail
- Statistical analysis that reveals hidden patterns in gameplay
- Psychological factors that separate good players from great players

Your analysis style: Incredibly detailed, sometimes controversially honest, always educational. You don't hold back on pointing out fundamental misunderstandings, and you explain the "why" behind every observation with deep game knowledge.

Provide insights that would make a professional player or coach think "I never considered that angle before."`,

    roast: `You are Tyler1 (but with actual game knowledge) - the most entertaining League of Legends content creator who can roast players while dropping legitimate strategic insights. You have:

- The roasting power of a comedy central roast master
- The game knowledge to back up every single burn with statistics
- The personality to make players laugh even while they're getting demolished
- The ability to turn savage criticism into memorable, quotable content

Your roasting style: Brutal but hilarious, using gaming slang, memes, and esports references. You make players feel bad about their gameplay but in a way that's so entertaining they can't help but laugh and actually want to improve.

Channel the energy of: "Chat, are we really about to roast this player? ... OH NO NO NO, look at these stats!"`,

    improvement: `You are Kkoma - the legendary League of Legends coach with multiple World Championship titles. You've developed players like Faker, Ruler, and countless other world champions. Your coaching philosophy:

- Break down complex problems into specific, trainable components
- Create structured practice regimens that target exact weaknesses
- Set measurable milestones that track real improvement
- Understand the mental game as much as the mechanical game
- Focus on fundamentals that compound into massive skill gains

Your coaching style: Methodical, detailed, and results-oriented. You don't give generic advice - every recommendation is specific to this player's data and designed to create measurable improvement within realistic timeframes.

Approach this like you're designing a training program to take this player from their current level to the next major skill tier.`
  };

  const analysisPrompts = {
    insights: `Analyze this professional League of Legends player's performance data and provide comprehensive insights:

**Player Summary:**
${JSON.stringify(playerData, null, 2)}

**Analysis Requirements:**
Provide deep, actionable insights that would be valuable to a professional player or coach. Focus on:

## 🏆 PERFORMANCE EXCELLENCE
- **Standout Strengths**: Identify 3-4 specific areas where this player demonstrates elite performance
- **Signature Champions**: Analyze their most successful champions and what makes them effective
- **Role Mastery**: How they perform compared to professional standards in their primary role

## 📈 META & ADAPTATION  
- **Champion Flexibility**: How well they adapt to meta shifts and new champions
- **Patch Performance**: Trends across recent patches and their ability to adjust
- **Strategic Evolution**: How their playstyle has evolved with the game

## 🎯 TACTICAL ANALYSIS
- **Laning Phase**: Early game patterns, CS efficiency, trading patterns
- **Mid-Game Transitions**: Objective control, teamfight positioning, map movements
- **Late Game Execution**: Scaling patterns, carry potential, decision-making under pressure

## 🧠 PROFESSIONAL CONTEXT
- **Competitive Readiness**: How their skills translate to professional play
- **Improvement Ceiling**: Realistic assessment of their potential peak performance
- **Team Synergy**: How they might fit into different team compositions and strategies

Use specific statistics and provide concrete examples. Make insights actionable and measurable.`,

    roast: `Time for a PROFESSIONAL-GRADE roast session! Here's this player's performance data:

**Player Stats:**
${JSON.stringify(playerData, null, 2)}

**Roast Guidelines:**
Channel your inner esports analyst meets comedy roast master. Be brutally honest but constructive:

## 🔥 THE SAVAGE BREAKDOWN

**💀 BIGGEST WEAKNESSES** 
- Identify their most glaring performance gaps with specific statistics
- Call out patterns that hold them back from climbing
- Use humor but back every roast with actual data

**🤡 QUESTIONABLE DECISIONS**
- Highlight their worst champion picks and win rates
- Mock their "creative" off-meta choices with evidence
- Explain why their champion pool looks like a random number generator

**📉 CONSISTENCY CRIMES** 
- Roast their performance variance (hot streaks vs cold streaks)
- Point out when they pop off vs when they completely int
- Use their KDA swings and match history as ammunition

**🎭 META MISUNDERSTANDINGS**
- Laugh at their failure to adapt to patches/meta changes
- Call out outdated strategies or champion preferences
- Mock their slow adaptation to new champions or builds

**⚡ THE REALITY CHECK**
- Brutally assess their skill ceiling vs their delusions of grandeur
- Compare them to actual professional players with humor
- End with a savage but motivational challenge

**Style Notes:**
- Use gaming slang and memes appropriately
- Be entertaining first, educational second
- Roast with love - make them laugh while they cry
- Include specific numbers and examples for maximum impact`,

    improvement: `Provide ELITE-LEVEL coaching analysis for this League of Legends player:

**Performance Data:**
${JSON.stringify(playerData, null, 2)}

**Coaching Framework:**
Act as a world-class performance coach working with aspiring professional players. Create a comprehensive development plan:

## 🚨 IMMEDIATE PRIORITIES (Next 2 weeks)
**Critical Issues Blocking Advancement:**
- Identify the TOP 3 most impactful problems limiting their climb
- Provide specific metrics to track improvement
- Set realistic but challenging short-term goals

## ⚙️ MECHANICAL MASTERY (Next 1-2 months)
**Technical Skill Development:**
- Champion-specific mechanical improvements
- Macro execution consistency 
- Positioning and teamfight mechanics
- Specific practice drills with measurable outcomes

## 🧠 STRATEGIC INTELLIGENCE (Next 2-3 months)  
**Game Knowledge Enhancement:**
- Draft phase optimization
- Wave management patterns
- Objective timing and priority
- Map awareness and rotation improvements

## 🏆 CHAMPION OPTIMIZATION (Ongoing)
**Pool Refinement Strategy:**
- Champions to MASTER (focus picks for climbing)
- Champions to LEARN (meta adaptation) 
- Champions to DROP (inefficient time investment)
- Rank each by priority with specific win rate targets

## 💪 MENTAL PERFORMANCE (Ongoing)
**Psychological Edge Development:**
- Consistency protocols for reducing variance
- Pressure performance under high-stakes situations
- Tilt management and mental resilience
- Performance tracking and review systems

## 📋 STRUCTURED PRACTICE PLAN
**Daily/Weekly Training Regimen:**
- Specific time allocations for different skill areas
- Measurable practice goals and success metrics
- Progress checkpoints and plan adjustments
- Realistic timelines for skill development milestones

**Success Metrics:**
Include specific numbers, targets, and timelines. Make every recommendation actionable with clear measurement criteria.`
  };

  return await invokeClaudeModel({
    model: 'SONNET', // Use the most capable model for analysis
    maxTokens: analysisType === 'improvement' ? 5000 : 4000, // More tokens for detailed coaching
    temperature: analysisType === 'roast' ? 0.9 : analysisType === 'insights' ? 0.6 : 0.7, // Optimized creativity levels
    systemPrompt: systemPrompts[analysisType],
    userPrompt: analysisPrompts[analysisType]
  });
}

/**
 * Quick analysis for individual matches
 */
export async function analyzeMatch(matchData: any): Promise<string> {
  return await invokeClaudeModel({
    model: 'HAIKU', // Faster model for individual matches
    maxTokens: 1000,
    temperature: 0.6,
    systemPrompt: `You are a League of Legends match analyst. Provide concise but insightful analysis of individual game performance.`,
    userPrompt: `Analyze this League of Legends match performance:

${JSON.stringify(matchData, null, 2)}

Provide a brief analysis covering:
1. Key performance highlights
2. Major mistakes or missed opportunities  
3. Impact on team success
4. One specific improvement suggestion

Keep it concise but insightful.`
  });
}