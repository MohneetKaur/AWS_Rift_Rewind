import { type NextRequest, NextResponse } from "next/server"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"

export async function GET(request: NextRequest) {
  try {
    console.log("Testing S3 connection...")
    console.log("AWS_REGION:", process.env.AWS_REGION)
    console.log("S3_BUCKET:", process.env.S3_BUCKET)
    console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID ? "SET" : "NOT SET")
    console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY ? "SET" : "NOT SET")

    const s3Client = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    })

    const testKey = "raw/cluster=ASIA/platform=KR/player=-xcGtW5IiRCa5zoyKayq8FnDuyXKaZ4j3bGhzlnFTFCaN6pbXVwR8VrGwILuGMuQRFvQw5_hrhygyA/account.json.gz"
    
    console.log("Testing key:", testKey)
    
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET || "rift-rewind-dataset",
      Key: testKey,
    })
    
    const response = await s3Client.send(command)
    console.log("S3 response received, content length:", response.ContentLength)
    
    return NextResponse.json({
      success: true,
      message: "S3 connection successful",
      contentLength: response.ContentLength,
      lastModified: response.LastModified
    })
  } catch (error) {
    console.error("S3 connection error:", error)
    return NextResponse.json(
      { 
        error: "S3 connection failed", 
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}