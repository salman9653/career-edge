
'use client';

import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

// Dynamically import Monaco Editor with SSR disabled
const Editor = dynamic(() => import('@monaco-editor/react').then(mod => ({ default: mod.Editor })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[150px] w-full rounded-md border border-input bg-transparent">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ),
});

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string | undefined) => void;
}

export const CodeEditor = ({ language, value, onChange }: CodeEditorProps) => {
  const { resolvedTheme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className={cn(
        "w-full rounded-md border border-input bg-transparent transition-colors focus-within:border-b-ring focus-within:border-b-2 overflow-hidden",
        isFocused && "border-b-ring border-b-2"
    )}>
      <Editor
        height="150px"
        language={language}
        value={value}
        onChange={onChange}
        theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
        loading={<Loader2 className="h-6 w-6 animate-spin" />}
        onMount={(editor) => {
            editor.onDidFocusEditorWidget(() => setIsFocused(true));
            editor.onDidBlurEditorWidget(() => setIsFocused(false));
        }}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          padding: {
            top: 10,
            bottom: 10,
          },
          automaticLayout: true,
        }}
      />
    </div>
  );
};
