

'use client';

import dynamic from 'next/dynamic';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
 Undo,
  Redo,
  ImageIcon,
  Loader2,
} from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from './button';

// Dynamically import the editor core with SSR disabled
const RichTextEditorCore = dynamic(() => import('./rich-text-editor-core'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[150px] w-full rounded-md border border-input bg-transparent">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ),
});

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    showImageOption?: boolean;
}

export const RichTextEditor = ({ value, onChange, showImageOption = true }: RichTextEditorProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={cn("rounded-md border border-input transition-colors", isFocused && "border-b-ring border-b-2")}>
      <RichTextEditorCore 
        value={value}
        onChange={onChange}
        isFocused={isFocused}
        setIsFocused={setIsFocused}
      />
    </div>
  );
};
