"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContractUploadProps {
  onFileUpload: (file: File) => void
  isProcessing: boolean
}

export function ContractUpload({ onFileUpload, isProcessing }: ContractUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileUpload(acceptedFiles[0])
      }
    },
    [onFileUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    disabled: isProcessing,
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400",
        isProcessing && "opacity-50 cursor-not-allowed",
      )}
    >
      <input {...getInputProps()} />

      {isProcessing ? (
        <div className="space-y-4">
          <Loader2 className="h-12 w-12 text-blue-500 mx-auto animate-spin" />
          <div>
            <h3 className="text-lg font-medium text-slate-900">Processing Contract...</h3>
            <p className="text-slate-600">AI agents are analyzing your contract</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-center">
            {isDragActive ? (
              <Upload className="h-12 w-12 text-blue-500" />
            ) : (
              <FileText className="h-12 w-12 text-slate-400" />
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium text-slate-900">
              {isDragActive ? "Drop your contract here" : "Upload a contract"}
            </h3>
            <p className="text-slate-600">Drag and drop a PDF or DOCX file, or click to browse</p>
          </div>

          <Button variant="outline" className="mt-4 bg-transparent">
            Choose File
          </Button>
        </div>
      )}
    </div>
  )
}
