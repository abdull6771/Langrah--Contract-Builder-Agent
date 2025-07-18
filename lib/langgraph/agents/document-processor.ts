import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import * as pdfParse from "pdf-parse"
import mammoth from "mammoth"

export interface ProcessedDocument {
  text: string
  sections: Array<{
    title: string
    content: string
    type: string
  }>
  keyTerms: {
    parties: string[]
    effectiveDate: string
    terminationDate: string
    paymentTerms: string
    governingLaw: string
  }
}

export class DocumentProcessor {
  async process(document: string, filename: string): Promise<ProcessedDocument> {
    // Extract text based on file type
    const text = await this.extractText(document, filename)

    // Split into sections
    const sections = await this.splitIntoSections(text)

    // Extract key terms
    const keyTerms = await this.extractKeyTerms(text)

    return {
      text,
      sections,
      keyTerms,
    }
  }

  private async extractText(document: string, filename: string): Promise<string> {
    const buffer = Buffer.from(document, "base64")

    if (filename.toLowerCase().endsWith(".pdf")) {
      const data = await pdfParse(buffer)
      return data.text
    } else if (filename.toLowerCase().endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer })
      return result.value
    }

    throw new Error("Unsupported file format")
  }

  private async splitIntoSections(text: string): Promise<
    Array<{
      title: string
      content: string
      type: string
    }>
  > {
    const { text: sectionsText } = await generateText({
      model: openai("gpt-4o"),
      system: `You are a legal document analyzer. Split the contract into logical sections and identify their types.
      
      Return a JSON array of sections with the following structure:
      [
        {
          "title": "Section title",
          "content": "Section content",
          "type": "section_type" // e.g., "preamble", "definitions", "obligations", "termination", etc.
        }
      ]`,
      prompt: `Analyze this contract text and split it into logical sections:\n\n${text}`,
    })

    try {
      return JSON.parse(sectionsText)
    } catch (error) {
      console.error("Error parsing sections:", error)
      return [
        {
          title: "Full Document",
          content: text,
          type: "general",
        },
      ]
    }
  }

  private async extractKeyTerms(text: string): Promise<{
    parties: string[]
    effectiveDate: string
    terminationDate: string
    paymentTerms: string
    governingLaw: string
  }> {
    const { text: keyTermsText } = await generateText({
      model: openai("gpt-4o"),
      system: `You are a legal document analyzer. Extract key terms from contracts.
      
      Return a JSON object with the following structure:
      {
        "parties": ["Party 1 Name", "Party 2 Name"],
        "effectiveDate": "Date or 'Not specified'",
        "terminationDate": "Date or 'Not specified'",
        "paymentTerms": "Payment terms summary or 'Not specified'",
        "governingLaw": "Governing law jurisdiction or 'Not specified'"
      }`,
      prompt: `Extract key terms from this contract:\n\n${text}`,
    })

    try {
      return JSON.parse(keyTermsText)
    } catch (error) {
      console.error("Error parsing key terms:", error)
      return {
        parties: [],
        effectiveDate: "Not specified",
        terminationDate: "Not specified",
        paymentTerms: "Not specified",
        governingLaw: "Not specified",
      }
    }
  }
}
