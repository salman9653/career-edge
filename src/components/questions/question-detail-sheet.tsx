
'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';
import type { Question } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Edit, Trash2, Pen, X, Check, Shield, Loader2, AlertTriangle, Code } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { deleteQuestionAction, updateQuestionStatusAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import { useSession } from '@/hooks/use-session';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';

interface QuestionDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: Question | null;
  context: 'assessment' | 'question-bank';
}

export function QuestionDetailSheet({ open, onOpenChange, question: initialQuestion, context }: QuestionDetailSheetProps) {

  console.log(initialQuestion)
  const [question, setQuestion] = useState(initialQuestion);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { session } = useSession();


  useEffect(() => {
    setQuestion(initialQuestion);
  }, [initialQuestion]);

  if (!question) return null;

  const canEdit = session?.role === 'admin' || (question.libraryType === 'custom' && question.addedBy === session?.uid);
  const showControls = canEdit && context !== 'assessment';

  const handleStatusChange = async (newStatus: 'active' | 'inactive') => {
    if (!showControls) return;
    setIsUpdating(true);
    const result = await updateQuestionStatusAction(question.id, newStatus);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error updating status',
        description: result.error,
      });
    } else {
      setQuestion(prev => prev ? { ...prev, status: newStatus } : null);
      toast({
        title: 'Status Updated',
        description: `Question status changed to ${newStatus}.`,
      });
    }
    setIsUpdating(false);
  };
  
  const handleDelete = async () => {
    if (!showControls) return;
    const result = await deleteQuestionAction(question.id);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error deleting question',
        description: result.error,
      });
    } else {
      toast({
        title: 'Question Deleted',
        description: 'The question has been successfully deleted.',
      });
      onOpenChange(false);
    }
  };

  const getDifficultyDisplay = (level: number) => {
      switch(level) {
          case 1: return { text: 'Easy', className: 'text-green-600 dark:text-green-400' };
          case 2: return { text: 'Medium', className: 'text-yellow-600 dark:text-yellow-400' };
          case 3: return { text: 'Hard', className: 'text-red-600 dark:text-red-400' };
          default: return { text: 'N/A', className: ''};
      }
  }

  const difficulty = getDifficultyDisplay(question.difficulty);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
        return format(new Date(dateString), "dd MMM yyyy");
    } catch (e) {
        return "Invalid Date";
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent showClose={false} className="sm:max-w-2xl w-full flex flex-col p-0">
        <TooltipProvider>
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-start justify-between">
            <div>
                <SheetTitle className="font-headline text-2xl">Question Details</SheetTitle>
                <SheetDescription>
                Review the complete details for the selected question.
                </SheetDescription>
            </div>
            <div className="flex items-center gap-2">
                 {showControls && (
                 <>
                 <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" asChild>
                            <Link href={question.libraryType === 'library' 
                              ? `/dashboard/admin/questions/edit/${question.id}` 
                              : `/dashboard/company/questions/edit/${question.id}`}>
                              <Edit className="h-5 w-5" />
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Edit question</p>
                    </TooltipContent>
                 </Tooltip>
                <AlertDialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-5 w-5" />
                        </Button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Delete question</p>
                    </TooltipContent>
                  </Tooltip>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <div className="flex justify-center">
                          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                              <AlertTriangle className="h-6 w-6 text-destructive"/>
                          </div>
                      </div>
                      <AlertDialogTitle className="text-center">Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-center">
                        This action cannot be undone. This will permanently delete this question from the library.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                </>
                )}
                <SheetClose asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-5 w-5" />
                  </Button>
                </SheetClose>
            </div>
          </div>
        </SheetHeader>
        <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium capitalize">{question.type}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Status</span>
                      <DropdownMenu>
                      <Tooltip>
                        <TooltipTrigger asChild disabled={!showControls}>
                            <DropdownMenuTrigger asChild disabled={!showControls}>
                                <Button variant="ghost" className="justify-start p-0 h-auto group -ml-1 hover:bg-transparent disabled:opacity-100 disabled:cursor-text">
                                    <span className={cn("font-medium capitalize flex items-center gap-1", question.status === 'active' ? 'text-dash-primary' : 'text-gray-500')}>
                                        {question.status}
                                        {showControls && (isUpdating ? <Loader2 className="h-4 w-4 animate-spin text-dash-primary" /> : <Pen className="h-4 w-4 text-muted-foreground group-hover:text-dash-primary transition-colors" />)}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        {showControls && (
                        <TooltipContent>
                            <p>Update status</p>
                        </TooltipContent>
                        )}
                      </Tooltip>
                      <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleStatusChange('active')}><Shield className="mr-2 h-4 w-4 text-green-500" />Active</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange('inactive')}><X className="mr-2 h-4 w-4 text-gray-500" />Inactive</DropdownMenuItem>
                      </DropdownMenuContent>
                      </DropdownMenu>
                  </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Difficulty</span>
                      <span className={cn('font-medium', difficulty.className)}>{difficulty.text}</span>
                  </div>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                   {(question.libraryType === 'custom' || context === 'admin') && question.addedByName && (
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Created By</span>
                      <span className="font-medium">{question.addedByName}</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Created At</span>
                      <span className="font-medium">{formatDate(question.createdAt)}</span>
                  </div>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                   <div className="flex flex-col gap-1 col-span-2">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-medium">{Array.isArray(question.category) ? question.category.join(', ') : ''}</span>
                  </div>
              </div>
              <div className="space-y-2">
                  <h4 className="font-semibold">Question Statement</h4>
                  <div className="text-muted-foreground prose dark:prose-invert max-w-full" dangerouslySetInnerHTML={{ __html: question.question }} />
              </div>

              {question.type === 'mcq' && question.options && (
                  <div className="space-y-2">
                      <h4 className="font-semibold">Options</h4>
                      <ul className="space-y-2">
                          {question.options.map((option, index) => (
                              <li key={index} className="flex items-center text-muted-foreground">
                                  {option === question.correctAnswer ? 
                                      <CheckCircle2 className="h-5 w-5 mr-2 text-dash-primary" /> : 
                                      <Circle className="h-5 w-5 mr-2" />
                                  }
                                  <span>{option}</span>
                              </li>
                          ))}
                      </ul>
                  </div>
              )}

              {question.type === 'subjective' && question.answerSummary && (
                  <div className="space-y-2">
                      <h4 className="font-semibold">Answer Summary</h4>
                      <p className="text-muted-foreground">{question.answerSummary}</p>
                  </div>
              )}
              
              {question.type === 'code' && (
                <div className="space-y-6">
                    {question.functionName && question.boilerplate && (
                    <div className="space-y-2">
                        <h4 className="font-semibold">Languages & Boilerplate</h4>
                        <Tabs defaultValue={Object.keys(question.functionName)[0]} className="w-full">
                            <TabsList>
                                {Object.keys(question.functionName).map(lang => (
                                    <TabsTrigger key={lang} value={lang}>{lang}</TabsTrigger>
                                ))}
                            </TabsList>
                            {Object.entries(question.functionName).map(([lang, name]) => (
                                <TabsContent key={lang} value={lang}>
                                    <div className="p-4 bg-muted rounded-md space-y-2">
                                        <p className="text-sm"><span className="font-semibold">Function Name:</span> <code className="bg-background p-1 rounded-sm">{name}</code></p>
                                        <h5 className="font-semibold text-sm pt-2">Boilerplate:</h5>
                                        <pre className="bg-background p-2 rounded-md overflow-x-auto text-xs"><code>{question.boilerplate?.[lang]}</code></pre>
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                    )}
                    {question.examples && question.examples.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-semibold">Examples</h4>
                            {question.examples.map((ex, index) => (
                                <div key={index} className="p-4 bg-muted rounded-md">
                                    <h5 className="font-semibold text-sm mb-2">Example {index + 1}</h5>
                                    <div className="space-y-2 text-xs">
                                        <div><span className="font-semibold">Input:</span> <code className="bg-background p-1 rounded-sm">{ex.input}</code></div>
                                        <div><span className="font-semibold">Output:</span> <code className="bg-background p-1 rounded-sm">{ex.output}</code></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                     {question.constraints && question.constraints.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-semibold">Constraints</h4>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                                {question.constraints.map((c, i) => <li key={i}>{c}</li>)}
                            </ul>
                        </div>
                    )}
                     {question.testCases && question.testCases.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-semibold">Test Cases</h4>
                            <ul className="space-y-2 text-sm">
                                {question.testCases.map((tc, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                       <span className="font-semibold">{tc.sample ? 'Sample:' : 'Hidden:'}</span>
                                       <code className="bg-muted p-1 rounded-sm text-xs">Input: {tc.input}, Output: {tc.output}</code>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {question.hints && question.hints.length > 0 && (
                         <div className="space-y-2">
                            <h4 className="font-semibold">Hints</h4>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                                {question.hints.map((h, i) => <li key={i}>{h}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
              )}
          </div>
        </ScrollArea>
        </TooltipProvider>
      </SheetContent>
    </Sheet>
  );
}
