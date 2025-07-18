import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { ExtractedClause } from "./clause-extractor"

export interface RiskAssessment {
  overallRisk: "low" | "medium" | "high"
  criticalIssues: string[]
  recommendations: string[]
}

export class RiskAnalyzer {
  async analyze(clauses: ExtractedClause[], keyTerms: any): Promise<RiskAssessment> {
    // Analyze individual clause risks
    const clauseRisks = await this.analyzeClauseRisks(clauses)

    // Analyze overall contract structure and balance
    const structuralRisks = await this.analyzeStructuralRisks(clauses, keyTerms)

    // Generate comprehensive risk assessment
    const overallAssessment = await this.generateOverallAssessment(clauseRisks, structuralRisks)

    return overallAssessment
  }

  private async analyzeClauseRisks(clauses: ExtractedClause[]): Promise<{
    highRiskClauses: ExtractedClause[]
    mediumRiskClauses: ExtractedClause[]
    riskFactors: string[]
  }> {
    const highRiskClauses = clauses.filter((c) => c.riskLevel === "high")
    const mediumRiskClauses = clauses.filter((c) => c.riskLevel === "medium")

    const { text: riskFactorsText } = await generateText({
      model: openai("gpt-4o"),
      system: `You are a legal risk assessment expert. Analyze the provided clauses and identify specific risk factors.
      
      Return a JSON array of risk factors as strings.`,
      prompt: `Analyze these contract clauses and identify specific risk factors:
      
      High Risk Clauses:
      ${highRiskClauses.map((c) => `- ${c.type}: ${c.analysis}`).join("\n")}
      
      Medium Risk Clauses:
      ${mediumRiskClauses.map((c) => `- ${c.type}: ${c.analysis}`).join("\n")}`,
    })

    let riskFactors: string[] = []
    try {
      riskFactors = JSON.parse(riskFactorsText)
    } catch (error) {
      console.error("Error parsing risk factors:", error)
    }

    return {
      highRiskClauses,
      mediumRiskClauses,
      riskFactors,
    }
  }

  private async analyzeStructuralRisks(
    clauses: ExtractedClause[],
    keyTerms: any,
  ): Promise<{
    missingClauses: string[]
    imbalancedTerms: string[]
    structuralIssues: string[]
  }> {
    const clauseTypes = clauses.map((c) => c.type)

    const { text: structuralAnalysisText } = await generateText({
      model: openai("gpt-4o"),
      system: `You are a contract structure analyst. Evaluate the contract for structural risks and missing protections.
      
      Return a JSON object with this structure:
      {
        "missingClauses": ["list of important missing clause types"],
        "imbalancedTerms": ["list of terms that heavily favor one party"],
        "structuralIssues": ["list of structural problems with the contract"]
      }`,
      prompt: `Analyze this contract structure:
      
      Present Clause Types: ${clauseTypes.join(", ")}
      
      Key Terms:
      - Parties: ${keyTerms.parties?.join(", ") || "Not specified"}
      - Payment Terms: ${keyTerms.paymentTerms || "Not specified"}
      - Governing Law: ${keyTerms.governingLaw || "Not specified"}
      - Effective Date: ${keyTerms.effectiveDate || "Not specified"}
      - Termination Date: ${keyTerms.terminationDate || "Not specified"}`,
    })

    try {
      return JSON.parse(structuralAnalysisText)
    } catch (error) {
      console.error("Error parsing structural analysis:", error)
      return {
        missingClauses: [],
        imbalancedTerms: [],
        structuralIssues: [],
      }
    }
  }

  private async generateOverallAssessment(clauseRisks: any, structuralRisks: any): Promise<RiskAssessment> {
    const { text: assessmentText } = await generateText({
      model: openai("gpt-4o"),
      system: `You are a senior legal risk assessor. Provide a comprehensive risk assessment for this contract.
      
      Consider:
      - Number and severity of high-risk clauses
      - Missing important protections
      - Structural imbalances
      - Overall contract fairness
      
      Return a JSON object with this structure:
      {
        "overallRisk": "low|medium|high",
        "criticalIssues": ["list of the most critical issues that need immediate attention"],
        "recommendations": ["list of specific recommendations to mitigate risks"]
      }`,
      prompt: `Provide overall risk assessment based on:
      
      Clause Risks:
      - High Risk Clauses: ${clauseRisks.highRiskClauses?.length || 0}
      - Medium Risk Clauses: ${clauseRisks.mediumRiskClauses?.length || 0}
      - Risk Factors: ${clauseRisks.riskFactors?.join(", ") || "None identified"}
      
      Structural Risks:
      - Missing Clauses: ${structuralRisks.missingClauses?.join(", ") || "None identified"}
      - Imbalanced Terms: ${structuralRisks.imbalancedTerms?.join(", ") || "None identified"}
      - Structural Issues: ${structuralRisks.structuralIssues?.join(", ") || "None identified"}`,
    })

    try {
      return JSON.parse(assessmentText)
    } catch (error) {
      console.error("Error parsing overall assessment:", error)
      return {
        overallRisk: "medium",
        criticalIssues: ["Unable to complete full risk assessment"],
        recommendations: ["Manual review recommended"],
      }
    }
  }
}
