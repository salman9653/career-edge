'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil, Sparkles, Loader2, AlertTriangle, MoreVertical } from 'lucide-react';
import { FaRegFilePdf } from 'react-icons/fa';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { GeneratedResume } from '@/ai/flows/generate-ats-resume-flow-types';
import { RenameResumeDialog } from './rename-resume-dialog';

interface ResumeCardProps {
    resume: GeneratedResume;
    isSelected: boolean;
    isSelectModeActive: boolean;
    onCardClick: (id: string) => void;
    onSelectChange: (id: string, checked: boolean) => void;
    onDelete: (ids: string[]) => void;
}

export function ResumeCard({ resume, isSelected, isSelectModeActive, onCardClick, onSelectChange, onDelete }: ResumeCardProps) {
    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    
    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        const jsDate = date.toDate ? date.toDate() : new Date(date);
        return format(jsDate, "dd MMM yyyy");
    }

    return (
        <>
            <RenameResumeDialog
                resume={resume}
                open={isRenameOpen}
                onOpenChange={setIsRenameOpen}
            />
             <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex justify-center mb-2">
                            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                                <AlertTriangle className="h-6 w-6 text-destructive"/>
                            </div>
                        </div>
                        <AlertDialogTitle className="text-center">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                            This will permanently delete "{resume.name}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete([resume.id])} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <div onClick={() => onCardClick(resume.id)} className="relative group">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10 h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onSelect={() => setIsRenameOpen(true)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Analyze
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => setIsDeleteOpen(true)} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Card className={cn(
                    "hover:bg-accent transition-all duration-200 cursor-pointer h-[120px] flex items-center",
                    isSelected && "ring-2 ring-dash-primary bg-accent"
                )}>
                    <CardContent className="p-6 flex items-center gap-6">
                        <FaRegFilePdf className="h-16 w-16 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{resume.name}</p>
                            <p className="text-sm text-muted-foreground">
                                {formatDate(resume.createdAt)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                {isSelectModeActive && (
                    <div className="absolute top-3 left-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => onSelectChange(resume.id, !!checked)}
                            className="bg-background border-dash-primary data-[state=checked]:border-dash-primary h-5 w-5"
                        />
                    </div>
                )}
            </div>
        </>
    )
}
