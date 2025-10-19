
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { createLowlight, common } from 'lowlight';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const lowlight = createLowlight(common);

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
}

export const CodeEditor = ({ language, value, onChange }: CodeEditorProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: `<pre><code class="language-${language}">${value}</code></pre>`,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-full prose-sm sm:prose-base prose-p:my-0 min-h-[150px] w-full bg-transparent px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 custom-scrollbar',
      },
    },
    onUpdate({ editor }) {
      const code = editor.getText();
      onChange(code);
    },
    onFocus() {
      setIsFocused(true);
    },
    onBlur() {
      setIsFocused(false);
    },
  });
  
  useEffect(() => {
    if (editor && !editor.isFocused) {
        const content = `<pre><code class="language-${language}">${value}</code></pre>`;
        if(editor.getHTML() !== content) {
            editor.commands.setContent(content, false);
        }
    }
  }, [value, editor, language]);

  return (
    <div className={cn("rounded-md border border-input transition-colors", isFocused && "border-b-ring border-b-2")}>
      <div className="p-2 border-b text-xs text-muted-foreground bg-muted/50 rounded-t-md">
        Language: {language}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};
