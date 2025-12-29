'use client';
import React, { useState, useMemo, useContext, useTransition } from 'react';
import { VirtuosoGrid } from 'react-virtuoso';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, ListTodo, X, Trash2, Loader2, FileText, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { GeneratedResumeContext } from '@/context/generated-resume-context';
import type { GeneratedResume } from '@/ai/flows/generate-ats-resume-flow-types';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useSession } from '@/hooks/use-session';
import { deleteGeneratedResumeAction } from '@/app/actions';
import { ResumeCard } from './resume-card';

export function ResumesTable() {
    const { resumes, loading } = useContext(GeneratedResumeContext);
    const router = useRouter();
    const { session } = useSession();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isSelectModeActive, setIsSelectModeActive] = useState(false);
    const [selectedResumes, setSelectedResumes] = useState<string[]>([]);
    const [isDeleting, startDeleteTransition] = useTransition();

    const filteredResumes = useMemo(() => {
        let items = [...resumes];
        if (searchQuery) {
            items = items.filter(resume =>
                resume.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        items.sort((a, b) => {
            if (a.createdAt?.seconds && b.createdAt?.seconds) {
                return b.createdAt.seconds - a.createdAt.seconds;
            }
            return 0;
        });
        return items;
    }, [resumes, searchQuery]);

    const toggleSelectMode = () => {
        setIsSelectModeActive(!isSelectModeActive);
        setSelectedResumes([]);
    }

    const handleSelectAll = (checked: boolean) => {
        setSelectedResumes(checked ? filteredResumes.map(r => r.id) : []);
    };
    
    const handleRowSelect = (resumeId: string, checked: boolean) => {
        setSelectedResumes(prev => checked ? [...prev, resumeId] : prev.filter(id => id !== resumeId));
    };

    const handleCardClick = (resumeId: string) => {
        if (isSelectModeActive) {
            handleRowSelect(resumeId, !selectedResumes.includes(resumeId));
        } else {
            router.push(`/dashboard/candidate/resumes/${resumeId}`);
        }
    }
    
    const handleDelete = (resumeIds: string[]) => {
        if (!session?.uid || resumeIds.length === 0) return;
        startDeleteTransition(async () => {
            for (const resumeId of resumeIds) {
                await deleteGeneratedResumeAction(resumeId, session.uid);
            }
            toast({ title: `${resumeIds.length} resume(s) deleted.` });
            if (selectedResumes.length > 0) {
                setSelectedResumes(prev => prev.filter(id => !resumeIds.includes(id)));
            }
            if(selectedResumes.length === resumeIds.length) {
                setIsSelectModeActive(false);
            }
        });
    }

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex items-center gap-2">
                {isSelectModeActive ? (
                    <>
                        <div className="flex items-center gap-4 flex-1">
                             <Checkbox
                                id="select-all"
                                checked={filteredResumes.length > 0 && selectedResumes.length === filteredResumes.length}
                                onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                aria-label="Select all"
                            />
                            <span className="text-sm font-medium">{selectedResumes.length} selected</span>
                            <Button variant="ghost" size="sm" onClick={toggleSelectMode} className="h-10 gap-1 text-muted-foreground hover:text-foreground">
                                <X className="h-4 w-4" />
                                <span>Cancel</span>
                            </Button>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="h-10 gap-1" disabled={selectedResumes.length === 0 || isDeleting}>
                                    {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                    <span>Delete</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <div className="flex justify-center mb-2">
                                        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                                            <AlertTriangle className="h-6 w-6 text-destructive"/>
                                        </div>
                                    </div>
                                    <AlertDialogTitle className="text-center">Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-center">
                                        This will permanently delete {selectedResumes.length} resume(s). This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(selectedResumes)} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                                         {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </>
                ) : (
                    <>
                        <div className={cn("relative", isSearchFocused ? "flex-1" : "md:flex-1")}>
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search resumes..."
                                className="w-full rounded-lg bg-background pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                            />
                        </div>
                        <div className={cn("flex items-center gap-2", isSearchFocused && "hidden md:flex")}>
                            <Button variant="secondary" size="sm" onClick={toggleSelectMode} className="h-10 gap-1">
                                <ListTodo className="h-3.5 w-3.5" />
                                <span>Select</span>
                            </Button>
                            <Button size="sm" className="h-10 gap-1" asChild>
                                <Link href="/dashboard/candidate/resumes/new">
                                    <PlusCircle className="h-3.5 w-3.5" /> Generate New
                                </Link>
                            </Button>
                        </div>
                    </>
                )}
            </div>
            
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-[120px] p-4 rounded-lg border">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-16 w-16" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredResumes.length > 0 ? (
                <div className="flex-1 min-h-0">
                    <VirtuosoGrid
                        data={filteredResumes}
                        style={{ height: '100%' }}
                        components={{
                            List: React.forwardRef((props, ref) => (
                                <div 
                                    {...props} 
                                    ref={ref} 
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-4" 
                                />
                            )),
                            Item: React.forwardRef((props, ref) => (
                                <div {...props} ref={ref} className="h-full" />
                            ))
                        }}
                        itemContent={(index, resume) => (
                            <ResumeCard 
                                key={resume.id}
                                resume={resume}
                                isSelected={selectedResumes.includes(resume.id)}
                                isSelectModeActive={isSelectModeActive}
                                onCardClick={handleCardClick}
                                onSelectChange={handleRowSelect}
                                onDelete={handleDelete}
                            />
                        )}
                    />
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Resumes Generated Yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Click "Generate New" to create your first AI-powered resume.</p>
                </div>
            )}
        </div>
    );
}
