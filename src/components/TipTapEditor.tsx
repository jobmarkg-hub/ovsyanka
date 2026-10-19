import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

interface TipTapEditorProps {
  content: string;
  isEnhanced: boolean;
  onChange: (markdown: string) => void;
  onTimecodeClick?: (startMs: number) => void;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  content,
  isEnhanced,
  onChange,
  onTimecodeClick,
}) => {
  // Convert markdown to simple HTML for TipTap StarterKit
  const formatMarkdownToHtml = (md: string) => {
    return md
      .split('\n\n')
      .map((block) => {
        if (block.startsWith('# ')) {
          return `<h1 class="text-2xl font-serif font-normal text-textPrimary mt-6 mb-3">${block.replace('# ', '')}</h1>`;
        }
        if (block.startsWith('## ')) {
          return `<h2 class="text-xl font-serif font-normal text-textPrimary mt-5 mb-2">${block.replace('## ', '')}</h2>`;
        }
        if (block.startsWith('### ')) {
          return `<h3 class="text-base font-semibold text-textPrimary mt-4 mb-2">${block.replace('### ', '')}</h3>`;
        }
        if (block.includes('\n- ') || block.startsWith('- ') || block.includes('\n* ') || block.startsWith('* ')) {
          const items = block
            .split('\n')
            .filter((l) => l.trim().startsWith('-') || l.trim().startsWith('*'))
            .map((item) => {
              const text = item.replace(/^[-*]\s*/, '');
              // Match timecode [mm:ss - mm:ss]
              const timecodeFormatted = text.replace(
                /\[(\d{2}:\d{2}\s*-\s*\d{2}:\d{2})\]/g,
                `<span class="timecode-pill inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer hover:bg-emerald-100 transition ml-1" data-timecode="$1">▶ $1</span>`
              );
              return `<li class="my-1.5 leading-relaxed text-textPrimary">${timecodeFormatted}</li>`;
            })
            .join('');
          return `<ul class="list-disc pl-5 my-2 space-y-1 text-sm text-textPrimary">${items}</ul>`;
        }
        if (block.startsWith('1. ') || block.includes('\n1. ')) {
          const items = block
            .split('\n')
            .filter((l) => /^\d+\./.test(l.trim()))
            .map((item) => {
              const text = item.replace(/^\d+\.\s*/, '');
              return `<li class="my-1.5 leading-relaxed text-textPrimary">${text}</li>`;
            })
            .join('');
          return `<ol class="list-decimal pl-5 my-2 space-y-1 text-sm text-textPrimary">${items}</ol>`;
        }
        return `<p class="my-2 text-sm leading-relaxed text-textPrimary">${block}</p>`;
      })
      .join('');
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: 'Type your raw notes here during meeting (or let Ovsyanka capture speech)...',
      }),
    ],
    content: formatMarkdownToHtml(content),
    editorProps: {
      attributes: {
        class: 'prose prose-neutral max-w-none focus:outline-none min-h-[400px] text-sm leading-relaxed text-textPrimary',
      },
      handleClick: (view, pos, event) => {
        const target = event.target as HTMLElement;
        if (target && target.classList.contains('timecode-pill')) {
          const timecode = target.getAttribute('data-timecode');
          if (timecode && onTimecodeClick) {
            onTimecodeClick(14000); // Trigger audio seek callback
          }
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      // For MVP, extract text content or markdown
      onChange(editor.getText());
    },
  });

  useEffect(() => {
    if (editor && content) {
      const currentHtml = editor.getHTML();
      const newHtml = formatMarkdownToHtml(content);
      if (currentHtml !== newHtml) {
        editor.commands.setContent(newHtml);
      }
    }
  }, [content, isEnhanced, editor]);

  return (
    <div className="relative font-sans">
      <EditorContent editor={editor} />
    </div>
  );
};
