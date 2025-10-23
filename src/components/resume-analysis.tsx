
"use client";

import { useState, useRef, useTransition, DragEvent, useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { analyzeAndSaveResumeAction } from "@/app/actions";
import { Loader2, AlertCircle, Sparkles, UploadCloud, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientButton } from "./ui/gradient-button";
import { useSession } from "@/hooks/use-session";

const initialState: {
  analysisId?: string;
  error?: string;
} = {};

interface ResumeAnalysisProps {
  jobId: string;
  jobTitle: string;
  jobDescription: string;
  companyName: string;
  view?: 'drag-and-drop' | 'button';
}

export function ResumeAnalysis({ jobId, jobTitle, jobDescription, companyName, view = 'drag-and-drop' }: ResumeAnalysisProps) {
  const router = useRouter();
  const { session } = useSession();
  const [state, formAction] = useFormState(analyzeAndSaveResumeAction, initialState);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (state?.analysisId) {
      router.push(`/dashboard/candidate/resume-analysis/${state.analysisId}`);
    }
  }, [state, router]);

  const handleFile = (file: File) => {
    if (!session?.uid) return;
    setFileName(file.name);
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobId", jobId);
    formData.append("jobTitle", jobTitle);
    formData.append("jobDescription", jobDescription);
    formData.append("companyName", companyName);
    formData.append("userId", session.uid);
    startTransition(() => {
      formAction(formData);
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if(file.type.includes('pdf') || file.type.includes('document')) {
        handleFile(file);
      }
      event.dataTransfer.clearData();
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const error = state?.error;

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <Input
        id="resume-upload"
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx"
        disabled={isPending}
      />
      {view === 'drag-and-drop' ? (
        <div 
          className={cn(
              "relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors",
              isDragging && "border-dash-primary bg-dash-primary/10",
              isPending && "cursor-not-allowed opacity-50"
          )}
          onDrop={isPending ? undefined : handleDrop}
          onDragOver={isPending ? undefined : handleDragOver}
          onDragLeave={isPending ? undefined : handleDragLeave}
          onClick={isPending ? undefined : handleButtonClick}
        >
          {isPending ? (
            <>
              <Loader2 className="w-8 h-8 mb-4 text-muted-foreground animate-spin" />
              <p className="mb-2 text-sm text-muted-foreground">Analyzing...</p>
              <p className="text-xs text-muted-foreground">{fileName}</p>
            </>
          ) : (
            <>
              <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-muted-foreground">PDF, DOC, or DOCX (MAX. 5MB)</p>
            </>
          )}
        </div>
      ) : (
        <div className="text-center">
            <Button variant="link" onClick={handleButtonClick} className="text-base text-dash-primary" disabled={isPending}>
                <FileText className="mr-2 h-4 w-4" />
                Upload a resume to analyze
            </Button>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
