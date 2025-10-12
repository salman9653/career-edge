
"use client";

import { useState, useRef, useTransition, DragEvent } from "react";
import { useFormState } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { analyzeResumeAction } from "@/app/actions";
import { Loader2, AlertCircle, Sparkles, UploadCloud, FileText } from "lucide-react";
import type { AnalyzeResumeForJobMatchingOutput } from "@/ai/flows/resume-analysis-for-job-matching";
import { cn } from "@/lib/utils";
import { GradientButton } from "./ui/gradient-button";

const initialState: {
  result?: AnalyzeResumeForJobMatchingOutput;
  error?: string;
} = {};

interface ResumeAnalysisProps {
  jobDescription: string;
  view?: 'drag-and-drop' | 'button';
}

export function ResumeAnalysis({ jobDescription, view = 'drag-and-drop' }: ResumeAnalysisProps) {
  const [state, formAction] = useFormState(analyzeResumeAction, initialState);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    setFileName(file.name);
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);
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
  
  const result = state?.result;
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
      />
      {view === 'drag-and-drop' ? (
        <div 
          className={cn(
              "relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors",
              isDragging && "border-dash-primary bg-dash-primary/10"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleButtonClick}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-muted-foreground">PDF, DOC, or DOCX (MAX. 5MB)</p>
          </div>
        </div>
      ) : (
        <div className="text-center">
            <Button variant="link" onClick={handleButtonClick} className="text-base text-dash-primary">
                <FileText className="mr-2 h-4 w-4" />
                Upload a resume to analyze
            </Button>
        </div>
      )}
      
      {fileName && !isPending && <p className="text-sm text-muted-foreground text-center">Analyzed: {fileName}</p>}

      {isPending && (
        <div className="space-y-2">
          <p className="text-sm text-center text-muted-foreground">Analyzing resume against job description...</p>
          <Progress value={undefined} className="w-full" />
        </div>
      )}
        
      <div className="text-center mt-4">
        <GradientButton disabled>
            <Sparkles className="mr-2 h-4 w-4" />
            Analyze Resume
        </GradientButton>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="bg-secondary/40">
          <CardContent className="p-4 space-y-4">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Match Score</p>
              <p className="text-4xl font-bold font-headline text-primary">{result.matchScore}%</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Reasoning</h4>
              <p className="text-sm text-muted-foreground">{result.reasoning}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Identified Skills</h4>
              <div className="flex flex-wrap gap-2">
                {result.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Experience Summary</h4>
              <p className="text-sm text-muted-foreground">{result.experienceSummary}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Qualifications Summary</h4>
              <p className="text-sm text-muted-foreground">{result.qualificationsSummary}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
