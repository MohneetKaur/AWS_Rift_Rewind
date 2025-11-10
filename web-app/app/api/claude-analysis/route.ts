import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { analyzeLeaguePerformance } from '@/lib/bedrock-client';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const SUMMARIES_BUCKET = 'rift-rewind-summaries';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      puuid, 
      analysisType = 'insights',
      includeMatches = false,
      matchLimit = 10 
    } = body;

    if (!puuid) {
      return NextResponse.json(
        { error: 'PUUID is required' },
        { status: 400 }
      );
    }

    console.log(`🧠 Starting Claude analysis for player: ${puuid}`);
    console.log(`📊 Analysis type: ${analysisType}`);
    console.log(`🎮 Include matches: ${includeMatches} (limit: ${matchLimit})`);

    // Step 1: Fetch player summary from S3
    console.log('📥 Fetching player summary from S3...');
    const playerSummaryKey = `summaries/players/${puuid}.json`;
    
    let playerData;
    try {
      const getPlayerCommand = new GetObjectCommand({
        Bucket: SUMMARIES_BUCKET,
        Key: playerSummaryKey
      });
      
      const playerResponse = await s3Client.send(getPlayerCommand);
      const playerDataText = await playerResponse.Body?.transformToString();
      
      if (!playerDataText) {
        return NextResponse.json(
          { error: 'Player summary not found. Please ensure matches have been processed first.' },
          { status: 404 }
        );
      }
      
      playerData = JSON.parse(playerDataText);
      console.log(`✅ Player summary loaded: ${playerData.total_matches} matches`);
      
    } catch (error) {
      console.error('❌ Error fetching player summary:', error);
      return NextResponse.json(
        { error: 'Player summary not found or inaccessible' },
        { status: 404 }
      );
    }

    // Step 2: Optionally fetch recent match analyses
    let recentMatches = [];
    if (includeMatches && playerData.recent_matches) {
      console.log(`📥 Fetching ${matchLimit} recent match summaries...`);
      
      const matchPromises = playerData.recent_matches
        .slice(0, matchLimit)
        .map(async (match: any) => {
          try {
            const matchSummaryKey = `summaries/matches/${puuid}/${match.game_id}.json`;
            const getMatchCommand = new GetObjectCommand({
              Bucket: SUMMARIES_BUCKET,
              Key: matchSummaryKey
            });
            
            const matchResponse = await s3Client.send(getMatchCommand);
            const matchDataText = await matchResponse.Body?.transformToString();
            
            if (matchDataText) {
              return JSON.parse(matchDataText);
            }
            return null;
          } catch (error) {
            console.error(`Failed to fetch match ${match.game_id}:`, error);
            return null;
          }
        });

      const matchResults = await Promise.all(matchPromises);
      recentMatches = matchResults.filter(match => match !== null);
      
      console.log(`✅ Loaded ${recentMatches.length} match summaries`);
    }

    // Step 3: Prepare comprehensive data for Claude
    const analysisData = {
      player_summary: playerData,
      recent_matches: recentMatches,
      analysis_context: {
        total_matches_analyzed: playerData.total_matches,
        data_freshness: playerData.generated_at,
        analysis_scope: includeMatches ? `${recentMatches.length} recent matches included` : 'summary only'
      }
    };

    // Step 4: Generate Claude analysis
    console.log(`🧠 Generating ${analysisType} analysis with Claude...`);
    const startTime = Date.now();
    
    const claudeAnalysis = await analyzeLeaguePerformance(analysisData, analysisType as 'insights' | 'roast' | 'improvement');
    
    const analysisTime = Date.now() - startTime;
    console.log(`✅ Claude analysis completed in ${analysisTime}ms`);

    // Step 5: Structure the response
    const response = {
      success: true,
      analysis_type: analysisType,
      player_info: {
        puuid: puuid,
        total_matches: playerData.total_matches,
        win_rate: playerData.performance?.win_rate,
        avg_kda: playerData.performance?.avg_kda,
        champion_pool_size: playerData.champion_analysis?.champion_pool_size,
        main_champion: playerData.champion_analysis?.most_played_champions?.[0]?.name
      },
      claude_analysis: claudeAnalysis,
      metadata: {
        generated_at: new Date().toISOString(),
        analysis_time_ms: analysisTime,
        matches_included: includeMatches ? recentMatches.length : 0,
        data_source: 'AWS S3 Summaries',
        model_used: 'Claude 3.5 Sonnet',
        total_data_points: playerData.total_matches
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error in Claude analysis:', error);
    
    return NextResponse.json(
      {
        error: 'Analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Please ensure Bedrock is properly configured and Claude model access is enabled'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: '🧠 Claude Analysis API',
    description: 'POST to this endpoint with player PUUID for AI-powered League of Legends analysis',
    example_request: {
      puuid: 'player-puuid-here',
      analysisType: 'insights', // 'insights' | 'roast' | 'improvement'
      includeMatches: false,    // Include recent match details
      matchLimit: 10            // Number of recent matches to include
    },
    available_analysis_types: {
      insights: 'Comprehensive performance insights and professional analysis',
      roast: 'Entertaining but accurate performance critique',
      improvement: 'Specific, actionable coaching recommendations'
    }
  });
}