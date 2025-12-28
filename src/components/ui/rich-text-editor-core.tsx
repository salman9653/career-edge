import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';

interface RichTextEditorCoreProps {
  value: string;
  onChange: (value: string) => void;
  isFocused: boolean;
  setIsFocused: (focused: boolean) => void;
}

export default function RichTextEditorCore({ value, onChange, isFocused, setIsFocused }: RichTextEditorCoreProps) {
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
          'prose dark:prose-invert max-w-full prose-sm sm:prose-base prose-p:my-0 min-h-[150px] w-full bg-transparent px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 custom-scrollbar',
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

  return <EditorContent editor={editor} />;
}

// Export the editor instance type
export type { Editor } from '@tiptap/react';
