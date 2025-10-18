
'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
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
} from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useState, useRef } from 'react';
import { Button } from './button';

const TiptapToolbar = ({ editor, showImageOption = true }: { editor: Editor | null, showImageOption?: boolean }) => {
  if (!editor) {
    return null;
  }
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        if (src) {
          editor.chain().focus().setImage({ src }).run();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = () => {
    document.getElementById('tiptap-image-upload')?.click();
  }

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-md border-x border-t border-input bg-transparent p-2">
      <input id="tiptap-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      <Toggle
        size="sm"
        pressed={editor.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('italic')}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('strike')}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </Toggle>
      <Separator orientation="vertical" className="h-8 w-[1px]" />
      <Toggle
        size="sm"
        pressed={editor.isActive('bulletList')}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('orderedList')}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>
       <Separator orientation="vertical" className="h-8 w-[1px]" />
       <Toggle
        size="sm"
        pressed={editor.isActive('blockquote')}
        onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-4 w-4" />
      </Toggle>
       <Toggle
        size="sm"
        pressed={editor.isActive('codeBlock')}
        onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code className="h-4 w-4" />
      </Toggle>
      {showImageOption && (
        <>
            <Separator orientation="vertical" className="h-8 w-[1px]" />
            <Toggle
                size="sm"
                onPressedChange={triggerImageUpload}
            >
                <ImageIcon className="h-4 w-4" />
            </Toggle>
        </>
      )}
    </div>
  );
};

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    showImageOption?: boolean;
}

export const RichTextEditor = ({ value, onChange, showImageOption = true }: RichTextEditorProps) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const editor = useEditor({
    extensions: [
        StarterKit.configure({
            codeBlock: {
                languageClassPrefix: 'language-',
            },
        }), 
        Image.configure({
            inline: false,
            allowBase64: true,
            HTMLAttributes: {
                class: 'max-w-[100px] h-auto rounded-md',
            },
        })
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert prose-sm sm:prose-base prose-p:my-2 min-h-[150px] w-full bg-transparent px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 custom-scrollbar',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    onFocus() {
      setIsFocused(true);
    },
    onBlur() {
      setIsFocused(false);
    }
  });

  return (
    <div className={cn("rounded-md border border-input transition-colors", isFocused && "border-b-ring border-b-2")}>
      <TiptapToolbar editor={editor} showImageOption={showImageOption} />
      <EditorContent editor={editor} />
    </div>
  );
};
