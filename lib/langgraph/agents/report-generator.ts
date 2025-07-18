import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { ExtractedClause } from "./clause-extractor"
import type { RiskAssessment } from "./risk-analyzer"

export interface ReportData {
  filename: string
  clauses: ExtractedClause[]
  riskAssessment: RiskAssessment
  keyTerms: any
}

export class ReportGenerator {
  async generate(data: ReportData): Promise<string> {
    const { text: report } = await generateText({
      model: openai("gpt-4o"),
      system: `You are a legal report writer. Generate a comprehensive, professional contract analysis report.
      
      The report should include:
      1. Executive Summary
      2. Contract Overview
      3. Key Terms Analysis
      4. Clause-by-Clause Review
      5. Risk Assessment
      6. Recommendations
      7. Conclusion
      
      Use professional legal language but keep it accessible. Format as HTML for easy rendering.`,
      prompt: `Generate a comprehensive contract analysis report for: ${data.filename}
      
      Key Terms:
      ${JSON.stringify(data.keyTerms, null, 2)}
      
      Extracted Clauses:
      ${data.clauses.map((c) => `${c.type}: ${c.riskLevel} risk - ${c.analysis}`).join("\n")}
      
      Risk Assessment:
      - Overall Risk: ${data.riskAssessment.overallRisk}
      - Critical Issues: ${data.riskAssessment.criticalIssues.join(", ")}
      - Recommendations: ${data.riskAssessment.recommendations.join(", ")}`,
    })

    return report
  }

  async generatePDF(data: ReportData): Promise<Buffer> {
    // This would integrate with a PDF generation library
    // For now, return a placeholder
    const htmlReport = await this.generate(data)

    // In a real implementation, you would use libraries like:
    // - puppeteer for HTML to PDF conversion
    // - jsPDF for direct PDF generation
    // - @react-pdf/renderer for React-based PDF generation

    return Buffer.from(htmlReport, "utf-8")
  }
}
