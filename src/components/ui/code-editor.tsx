
'use client';

import { Editor } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { Loader2 } from 'lucide-react';

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string | undefined) => void;
}

export const CodeEditor = ({ language, value, onChange }: CodeEditorProps) => {
  const { resolvedTheme } = useTheme();
  
  return (
      <Editor
        height="150px"
        language={language}
        value={value}
        onChange={onChange}
        theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
        loading={<Loader2 className="h-6 w-6 animate-spin" />}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
        }}
      />
  );
};
