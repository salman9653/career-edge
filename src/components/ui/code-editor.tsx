
'use client';

import { Textarea } from './textarea';
import { cn } from '@/lib/utils';
import { Label } from './label';
import { Input } from './input';

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
}

export const CodeEditor = ({ language, value, onChange }: CodeEditorProps) => {
  return (
    <div className={cn("rounded-md border border-input transition-colors")}>
      <div className="p-2 border-b text-xs text-muted-foreground bg-muted/50 rounded-t-md">
        Language: {language}
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 min-h-[150px] border-0 rounded-t-none"
        placeholder={`Enter ${language} boilerplate code...`}
      />
    </div>
  );
};
