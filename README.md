# ContractIQ Builder

ContractIQ Builder is an AI-powered contract review and risk analysis system built with Next.js, React, and LangGraph. It enables users to upload legal contracts (PDF or DOCX), automatically extracts and analyzes clauses, assesses risks, and generates comprehensive analysis reports.

## Features

- **Contract Upload:** Upload PDF or DOCX contracts for automated analysis.
- **Clause Extraction:** AI-driven extraction and classification of contract clauses.
- **Risk Assessment:** Automated risk analysis for each clause and the overall contract.
- **Key Terms Extraction:** Identification of key contract terms (parties, dates, payment terms, governing law, etc.).
- **Comprehensive Reports:** Downloadable, professional analysis reports in PDF format.
- **User Dashboard:** View analysis results, risk summaries, and recommendations for all uploaded contracts.

## Technology Stack

- **Frontend:** Next.js, React, Tailwind CSS, Radix UI
- **AI/Workflow:** LangGraph, LangChain, OpenAI GPT-4o
- **Document Parsing:** pdf-parse, mammoth
- **PDF Generation:** (Planned) Integration with HTML-to-PDF libraries

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm/yarn

### Installation

```bash
pnpm install
# or
npm install
```

### Development

```bash
pnpm dev
# or
npm run dev
```

### Build for Production

```bash
pnpm build
# or
npm run build
```

## Usage

1. Open the app in your browser.
2. Upload a contract file (PDF or DOCX).
3. Wait for the AI-powered analysis to complete.
4. View extracted clauses, risk assessments, and key terms.
5. Download a comprehensive analysis report as a PDF.

## API Endpoints

### POST `/api/analyze-contract`
- **Description:** Analyze an uploaded contract.
- **Request:** `multipart/form-data` with a `contract` file (PDF or DOCX).
- **Response:** JSON with analysis results, including extracted clauses, risk summary, and key terms.

### GET `/api/generate-report/[id]`
- **Description:** Download a PDF analysis report for a contract (mock data in current implementation).
- **Response:** PDF file.

## Project Structure

- `app/` – Next.js app directory (pages, API routes, layout)
- `components/` – Reusable React components (UI, analysis results, upload, etc.)
- `lib/langgraph/` – AI workflow and agents (document processing, clause extraction, risk analysis, report generation)
- `styles/` & `app/globals.css` – Tailwind CSS and global styles

## License

This project is licensed under the MIT License.