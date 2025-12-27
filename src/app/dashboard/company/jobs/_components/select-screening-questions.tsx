
'use client';
import { useState, useContext, useEffect, useMemo, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PlusCircle, Trash2, ArrowLeft, Loader2, Search } from 'lucide-react';
import { addQuestionAction } from '@/app/actions';
import { useSession } from '@/hooks/use-session';
import { useToast } from '@/hooks/use-toast';
import type { Question } from '@/lib/types';
import { QuestionContext } from '@/context/question-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

interface ScreeningQuestionState {
  error?: string | null;
  success?: boolean;
  newQuestionId?: string | null;
  from?: string | null;
}

const initialState: ScreeningQuestionState = {
  error: null,
  success: false,
  newQuestionId: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="animate-spin" /> : 'Add This Question'}
    </Button>
  );
}

interface SelectScreeningQuestionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedQuestions: Question[];
  onSelectQuestions: (questions: Question[]) => void;
}

export function SelectScreeningQuestions({ open, onOpenChange, selectedQuestions, onSelectQuestions }: SelectScreeningQuestionsProps) {
  const { session } = useSession();
  const { toast } = useToast();
  const { questions: allQuestions, loading: questionsLoading } = useContext(QuestionContext);
  
  const [view, setView] = useState<'list' | 'form'>('list');
  const [state, formAction] = useActionState<ScreeningQuestionState, FormData>(addQuestionAction, initialState);
  
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [acceptableAnswers, setAcceptableAnswers] = useState<string[]>([]);
  const [isStrict, setIsStrict] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const screeningQuestions = useMemo(() => {
    if (!session?.uid) return [];
    let questions = allQuestions.filter(q => q.type === 'screening' && q.libraryType === 'custom' && q.addedBy === session.uid);
    if(searchQuery) {
        questions = questions.filter(q => q.question.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return questions;
  }, [allQuestions, session?.uid, searchQuery]);
  
  useEffect(() => {
    if (state.success && state.newQuestionId && state.from === 'screening') {
      toast({ title: 'Question added successfully' });
      
      const newQuestion = allQuestions.find(q => q.id === state.newQuestionId);
      if (newQuestion && !selectedQuestions.some(sq => sq.id === newQuestion.id)) {
        onSelectQuestions([...selectedQuestions, newQuestion]);
      }
      
      setView('list');
      // Reset form state
      setQuestionText('');
      setOptions(['', '']);
      setAcceptableAnswers([]);
      setIsStrict(false);
      setSearchQuery('');
      // Reset action state by calling it with null or an empty form data
      const emptyFormData = new FormData();
      formAction(emptyFormData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success, state.newQuestionId, state.from]);
  
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 4) setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== index));
  };

  const handleAcceptableAnswerChange = (option: string, checked: boolean) => {
    setAcceptableAnswers(prev => 
      checked ? [...prev, option] : prev.filter(a => a !== option)
    )
  }
  
  const handleQuestionSelection = (question: Question, isSelected: boolean) => {
    onSelectQuestions(
      isSelected ? [...selectedQuestions, question] : selectedQuestions.filter(q => q.id !== question.id)
    );
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelections = screeningQuestions.filter(q => !selectedQuestions.some(sq => sq.id === q.id));
      onSelectQuestions([...selectedQuestions, ...newSelections]);
    } else {
      const screeningQuestionIds = screeningQuestions.map(q => q.id);
      onSelectQuestions(selectedQuestions.filter(q => !screeningQuestionIds.includes(q.id)));
    }
  }

  const areAllSelected = screeningQuestions.length > 0 && screeningQuestions.every(q => selectedQuestions.some(sq => sq.id === q.id));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            {view === 'form' && (
              <Button variant="ghost" size="icon" onClick={() => setView('list')}><ArrowLeft className="h-5 w-5" /></Button>
            )}
            <div>
              <SheetTitle className="font-headline text-2xl">
                {view === 'list' ? 'Select Screening Questions' : 'Add New Screening Question'}
              </SheetTitle>
              <SheetDescription>
                {view === 'list' ? 'Choose from your saved questions or add a new one.' : 'This will be added to your custom question bank.'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {view === 'list' ? (
          <div className="flex-1 overflow-auto p-6 custom-scrollbar">
            <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search questions..."
                        className="w-full rounded-lg bg-background pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button onClick={() => setView('form')} className="gap-1">
                    <PlusCircle className="h-4 w-4" /> Add New
                </Button>
            </div>
             <div className="flex items-center space-x-3 p-3">
              <Checkbox
                id="select-all-screening"
                checked={areAllSelected}
                onCheckedChange={(checked) => handleSelectAll(!!checked)}
              />
              <Label htmlFor="select-all-screening" className="font-semibold cursor-pointer">
                Select All
              </Label>
            </div>
             <div className="space-y-3">
                {screeningQuestions.map(q => (
                    <div key={q.id} className="flex items-center space-x-3 p-3 rounded-md border bg-secondary/50">
                        <Checkbox
                            id={q.id}
                            checked={selectedQuestions.some(sq => sq.id === q.id)}
                            onCheckedChange={(checked) => handleQuestionSelection(q, !!checked)}
                        />
                        <Label htmlFor={q.id} className="font-normal flex-1 cursor-pointer">{q.question}</Label>
                    </div>
                ))}
                 {screeningQuestions.length === 0 && !questionsLoading && (
                    <p className="text-center text-sm text-muted-foreground pt-8">
                        {searchQuery ? `No questions found for "${searchQuery}"` : "You haven't created any screening questions yet."}
                    </p>
                )}
                {questionsLoading && <p className="text-center text-sm text-muted-foreground pt-8">Loading questions...</p>}
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1">
          <form action={formAction}>
            <div className="p-6 space-y-6">
              <input type="hidden" name="type" value="screening" />
              <input type="hidden" name="libraryType" value="custom" />
              <input type="hidden" name="addedBy" value={session?.uid} />
              <input type="hidden" name="addedByName" value={session?.name} />
              <input type="hidden" name="from" value="screening" />

              <div className="space-y-2">
                <Label htmlFor="question" className="text-base">Question Statement</Label>
                <Textarea id="question" name="question" required value={questionText} onChange={(e) => setQuestionText(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label className="text-base">Options</Label>
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        name="options"
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        required
                      />
                      {options.length > 2 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      )}
                    </div>
                  ))}
                  {options.length < 4 && (
                    <Button type="button" variant="outline" size="sm" onClick={addOption}><PlusCircle className="mr-2 h-4 w-4" /> Add Option</Button>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-base">Acceptable Answer(s)</Label>
                <div className="space-y-2">
                   {options.filter(opt => opt.trim() !== '').map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <Checkbox
                                id={`acceptable-${index}`}
                                name="acceptableAnswer"
                                value={option}
                                checked={acceptableAnswers.includes(option)}
                                onCheckedChange={(checked) => handleAcceptableAnswerChange(option, !!checked)}
                            />
                            <Label htmlFor={`acceptable-${index}`} className="font-normal">{option}</Label>
                        </div>
                   ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                  <Switch id="isStrict" name="isStrict" checked={isStrict} onCheckedChange={setIsStrict} />
                  <Label htmlFor="isStrict">Strictly match acceptable answer</Label>
              </div>
              
              {state?.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
              
              <SubmitButton />
            </div>
          </form>
          </ScrollArea>
        )}

        <SheetFooter className="p-6 pt-4 border-t bg-background">
            <Button onClick={() => onOpenChange(false)} className="w-full">Done</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
