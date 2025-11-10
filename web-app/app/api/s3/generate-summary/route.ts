import { type NextRequest, NextResponse } from "next/server"
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda"

const lambda = new LambdaClient({ 
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
})

export async function POST(request: NextRequest) {
  try {
    const { puuid } = await request.json()
    
    if (!puuid) {
      return NextResponse.json({ error: "Missing puuid parameter" }, { status: 400 })
    }

    console.log(`Generating summary for PUUID: ${puuid}`)

    // Invoke the simple summary Lambda function
    const payload = {
      puuid,
      bucket: "rift-rewind-dataset",
      output_bucket: "rift-rewind-summaries"
    }

    const command = new InvokeCommand({
      FunctionName: "simple-summary-lambda",
      InvocationType: "RequestResponse",
      Payload: JSON.stringify(payload)
    })

    const response = await lambda.send(command)
    const responsePayload = JSON.parse(new TextDecoder().decode(response.Payload))

    if (responsePayload.statusCode === 200) {
      const body = JSON.parse(responsePayload.body)
      
      return NextResponse.json({
        success: true,
        message: body.message,
        summary_location: body.summary_location,
        matches_processed: body.matches_processed
      })
    } else {
      const errorBody = JSON.parse(responsePayload.body)
      return NextResponse.json(
        { error: errorBody.error || "Lambda function failed" },
        { status: responsePayload.statusCode }
      )
    }

  } catch (error) {
    console.error("Error invoking Lambda function:", error)
    return NextResponse.json(
      { error: "Failed to generate player summary" },
      { status: 500 }
    )
  }
}

