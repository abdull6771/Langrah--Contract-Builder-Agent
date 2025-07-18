import { type NextRequest, NextResponse } from "next/server"
import { ContractAnalysisWorkflow } from "@/lib/langgraph/workflow"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("contract") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Document = buffer.toString("base64")

    // Initialize workflow
    const workflow = new ContractAnalysisWorkflow()

    // Analyze contract
    const result = await workflow.analyze(base64Document, file.name)

    // Format response
    const analysis = {
      id: uuidv4(),
      filename: file.name,
      status: "completed" as const,
      extractedClauses: result.clauses,
      riskSummary: result.riskAssessment,
      keyTerms: result.keyTerms,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Error analyzing contract:", error)
    return NextResponse.json({ error: "Failed to analyze contract" }, { status: 500 })
  }
}
