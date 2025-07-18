import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface ExtractedClause {
  type: string
  content: string
  riskLevel: "low" | "medium" | "high"
  analysis: string
}

export class ClauseExtractor {
  private readonly clauseTypes = [
    "indemnity",
    "limitation_of_liability",
    "termination",
    "payment_terms",
    "intellectual_property",
    "confidentiality",
    "force_majeure",
    "dispute_resolution",
    "governing_law",
    "warranties",
    "representations",
    "compliance",
  ]

  async extract(
    text: string,
    sections: Array<{ title: string; content: string; type: string }>,
  ): Promise<ExtractedClause[]> {
    const clauses: ExtractedClause[] = []

    // Extract clauses from each section
    for (const section of sections) {
      const sectionClauses = await this.extractFromSection(section.content, section.type)
      clauses.push(...sectionClauses)
    }

    // Also analyze the full text for any missed clauses
    const additionalClauses = await this.extractFromFullText(text)
    clauses.push(...additionalClauses)

    // Remove duplicates and return
    return this.deduplicateClauses(clauses)
  }

  private async extractFromSection(content: string, sectionType: string): Promise<ExtractedClause[]> {
    const { text: clausesText } = await generateText({
      model: openai("gpt-4o"),
      system: `You are a legal clause extraction expert. Identify and extract specific legal clauses from contract sections.

      Focus on these clause types: ${this.clauseTypes.join(", ")}
      
      For each clause found, assess its risk level:
      - HIGH: Clauses that heavily favor one party, have unlimited liability, or lack important protections
      - MEDIUM: Clauses with some concerning terms but reasonable overall
      - LOW: Standard, balanced clauses with appropriate protections
      
      Return a JSON array with this structure:
      [
        {
          "type": "clause_type",
          "content": "exact clause text",
          "riskLevel": "low|medium|high",
          "analysis": "brief analysis of the clause and why it has this risk level"
        }
      ]`,
      prompt: `Extract legal clauses from this contract section (type: ${sectionType}):\n\n${content}`,
    })

    try {
      return JSON.parse(clausesText)
    } catch (error) {
      console.error("Error parsing clauses from section:", error)
      return []
    }
  }

  private async extractFromFullText(text: string): Promise<ExtractedClause[]> {
    const { text: clausesText } = await generateText({
      model: openai("gpt-4o"),
      system: `You are a legal clause extraction expert. Perform a comprehensive analysis of the entire contract to identify any important clauses that might have been missed.

      Focus on these clause types: ${this.clauseTypes.join(", ")}
      
      Look for:
      - Hidden or embedded clauses within larger paragraphs
      - Cross-references between sections
      - Implied terms or conditions
      
      Return a JSON array with this structure:
      [
        {
          "type": "clause_type",
          "content": "exact clause text",
          "riskLevel": "low|medium|high",
          "analysis": "brief analysis of the clause and why it has this risk level"
        }
      ]`,
      prompt: `Perform a comprehensive clause extraction from this full contract text:\n\n${text.substring(0, 8000)}`, // Limit text length
    })

    try {
      return JSON.parse(clausesText)
    } catch (error) {
      console.error("Error parsing clauses from full text:", error)
      return []
    }
  }

  private deduplicateClauses(clauses: ExtractedClause[]): ExtractedClause[] {
    const seen = new Set<string>()
    return clauses.filter((clause) => {
      const key = `${clause.type}-${clause.content.substring(0, 100)}`
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }
}
