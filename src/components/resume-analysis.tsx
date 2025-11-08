
'use client';

import { useState, useRef, useTransition, DragEvent, useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { analyzeAndSaveResumeAction } from "@/app/actions";
import { Loader2, AlertCircle, Sparkles, UploadCloud, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";
import { GradientButton } from "./ui/gradient-button";

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
  const [state, formAction] = useActionState(analyzeAndSaveResumeAction, initialState);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (state?.analysisId) {
      const basePath = session?.role === 'candidate' ? '/dashboard/candidate' : '/dashboard/company';
      router.push(`${basePath}/resume-analysis/${state.analysisId}`);
    }
  }, [state, router, session?.role]);

  const handleFileSelect = (file: File | null) => {
    if (file && (file.type.includes('pdf') || file.type.includes('document'))) {
        setSelectedFile(file);
    } else {
        setSelectedFile(null);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    handleFileSelect(file || null);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      handleFileSelect(file);
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
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile || !session?.uid) return;

    const formData = new FormData(e.currentTarget);
    formData.append("resume", selectedFile);
    formData.append("jobId", jobId);
    formData.append("jobTitle", jobTitle);
    formData.append("jobDescription", jobDescription);
    formData.append("companyName", companyName);
    
    // For a company, the userId to save against is the company's own UID.
    // For a candidate, it's their own UID.
    const userIdForAction = session.role === 'company' || session.role === 'manager' 
        ? (session.role === 'company' ? session.uid : session.company_uid)
        : session.uid;

    if (userIdForAction) {
        formData.append("userId", userIdForAction);
    } else {
        // Handle case where company_uid is not available for manager
        // This is a fallback and ideally should not be hit
        formAction(new FormData()); // Trigger an error state
        return;
    }
    
    startTransition(() => {
        formAction(formData);
    });
  }
  
  const error = state?.error;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
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
            {selectedFile ? (
                <div className="text-center">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-semibold">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">Click or drag a different file to change</p>
                </div>
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
             {selectedFile ? (
                <div className="flex items-center justify-center gap-2">
                    <FileText className="h-4 w-4" />
                    <p>{selectedFile.name}</p>
                    <Button variant="link" onClick={handleButtonClick} className="text-xs">Change</Button>
                </div>
            ) : (
                <Button variant="link" onClick={handleButtonClick} className="text-base text-dash-primary" disabled={isPending}>
                    <FileText className="mr-2 h-4 w-4" />
                    Upload a resume to analyze
                </Button>
            )}
        </div>
      )}

      {selectedFile && (
          <div className="flex justify-center">
            <GradientButton type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {isPending ? 'Analyzing...' : 'Analyze Resume'}
            </GradientButton>
          </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
