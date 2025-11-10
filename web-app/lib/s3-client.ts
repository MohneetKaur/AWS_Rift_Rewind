import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { gunzip } from "zlib"
import { promisify } from "util"

const gunzipAsync = promisify(gunzip)

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

import { PutObjectCommand } from "@aws-sdk/client-s3"

const BUCKET_NAME = process.env.S3_BUCKET || "rift-rewind-dataset"

export interface PlayerData {
  account: any
  profile?: any
  ranked: any
  matches: any[]
  timelines: any[]
  manifest: any
}

// Helper function to get object from S3 and decompress
async function getS3Object(key: string): Promise<any> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
    
    const response = await s3Client.send(command)
    const compressedData = await response.Body?.transformToByteArray()
    
    if (!compressedData) {
      throw new Error(`No data found for key: ${key}`)
    }
    
    const decompressedData = await gunzipAsync(Buffer.from(compressedData))
    return JSON.parse(decompressedData.toString())
  } catch (error) {
    // Reduce console noise - only log if it's not a common 404
    if (error instanceof Error && !error.message.includes('NoSuchKey')) {
      console.error(`Error fetching S3 object ${key}:`, error)
    }
    throw error
  }
}

// Get player data by PUUID
export async function getPlayerData(puuid: string, cluster = "AMERICAS", platform = "NA1"): Promise<PlayerData> {
  const basePath = `raw/cluster=${cluster}/platform=${platform}/player=${puuid}`
  
  try {
    // Fetch core player data
    const [account, manifest] = await Promise.all([
      getS3Object(`${basePath}/account.json.gz`),
      getS3Object(`${basePath}/_manifest.json.gz`),
    ])
    
    // Try to fetch profile (may not exist for some players)
    let profile
    try {
      profile = await getS3Object(`${basePath}/profile.json.gz`)
    } catch (error) {
      console.log("Profile not found, continuing without it")
    }
    
    // Fetch ranked data
    const ranked = await getS3Object(`${basePath}/ranked.json.gz`)
    
    return {
      account,
      profile,
      ranked,
      matches: [], // Will fetch separately due to size
      timelines: [], // Will fetch separately due to size
      manifest,
    }
  } catch (error) {
    console.error(`Error fetching player data for PUUID ${puuid}:`, error)
    throw new Error(`Player data not found for PUUID: ${puuid}`)
  }
}

// Get match IDs for a player
export async function getMatchIds(puuid: string, cluster = "AMERICAS", platform = "NA1"): Promise<string[]> {
  const basePath = `raw/cluster=${cluster}/platform=${platform}/player=${puuid}`
  
  try {
    const manifest = await getS3Object(`${basePath}/_manifest.json.gz`)
    const idsData = await getS3Object(`${basePath}/ids/ids_${manifest.count}.json.gz`)
    return idsData.ids || []
  } catch (error) {
    console.error(`Error fetching match IDs for PUUID ${puuid}:`, error)
    return []
  }
}

// Get specific match data
export async function getMatchData(puuid: string, matchId: string, cluster = "AMERICAS", platform = "NA1"): Promise<any> {
  const basePath = `raw/cluster=${cluster}/platform=${platform}/player=${puuid}`
  
  try {
    // Find match file (need to search by patch folders)
    // Search all available patches based on actual S3 data
    const patches = [
      "14.13", "14.14", "14.15", "14.16", "14.17", "14.18", "14.19", "14.20", "14.21", "14.22", "14.23",
      "15.2", "15.4", "15.5", "15.6", "15.7", "15.8", "15.9", "15.10", 
      "15.11", "15.12", "15.13", "15.16", "15.17", "15.18", "15.19", "15.20", "15.21"
    ]
    
    for (const patch of patches) {
      try {
        const matchKey = `${basePath}/matches/patch=${patch}/${matchId}.match.json.gz`
        return await getS3Object(matchKey)
      } catch (error) {
        // Continue to next patch
        continue
      }
    }
    
    throw new Error(`Match ${matchId} not found in any patch`)
  } catch (error) {
    console.error(`Error fetching match ${matchId} for PUUID ${puuid}:`, error)
    throw error
  }
}

// Get timeline data for a match
export async function getTimelineData(puuid: string, matchId: string, cluster = "AMERICAS", platform = "NA1"): Promise<any> {
  const basePath = `raw/cluster=${cluster}/platform=${platform}/player=${puuid}`
  
  try {
    // Search all available patches based on actual S3 data
    const patches = [
      "14.13", "14.14", "14.15", "14.16", "14.17", "14.18", "14.19", "14.20", "14.21", "14.22", "14.23",
      "15.2", "15.4", "15.5", "15.6", "15.7", "15.8", "15.9", "15.10", 
      "15.11", "15.12", "15.13", "15.16", "15.17", "15.18", "15.19", "15.20", "15.21"
    ]
    
    for (const patch of patches) {
      try {
        const timelineKey = `${basePath}/timelines/patch=${patch}/${matchId}.timeline.json.gz`
        return await getS3Object(timelineKey)
      } catch (error) {
        // Silently continue to next patch - errors already handled by getS3Object
        continue
      }
    }
    
    throw new Error(`Timeline ${matchId} not found in any patch`)
  } catch (error) {
    // Only log if it's not a missing timeline (which is expected)
    if (error instanceof Error && !error.message?.includes('not found in any patch')) {
      console.error(`Error fetching timeline ${matchId} for PUUID ${puuid}:`, error)
    }
    throw error
  }
}

// Upload JSON data to S3
export async function uploadToS3(key: string, data: any): Promise<void> {
  try {
    const jsonData = JSON.stringify(data, null, 2)
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: jsonData,
      ContentType: 'application/json',
    })
    
    await s3Client.send(command)
    console.log(`Successfully uploaded to S3: ${key}`)
  } catch (error) {
    console.error(`Error uploading to S3 ${key}:`, error)
    throw error
  }
}

// Helper function to get player data by Riot ID (search across regions/platforms)
export async function findPlayerByRiotId(gameName: string, tagLine: string): Promise<{ puuid: string; cluster: string; platform: string } | null> {
  // This would require scanning S3 or maintaining an index
  // For now, we'll assume the caller knows the PUUID
  // In a real implementation, you might maintain a separate index or use the Riot API for lookup
  throw new Error("Finding player by Riot ID not implemented - use PUUID directly")
}