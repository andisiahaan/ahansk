'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';

interface Props {
  content: string;
  onChange: (html: string) => void;
}

const BTN_STYLE: React.CSSProperties = {
  padding: '0.25rem 0.5rem', border: '1px solid var(--color-border)',
  borderRadius: '0.375rem', background: 'transparent', color: 'var(--color-muted)',
  cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
};

export function RichEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false })],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'rich-editor-content', style: 'min-height:240px;outline:none;padding:0.75rem;font-size:0.875rem;line-height:1.7;' },
    },
  });

  if (!editor) return null;

  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: '0.5rem', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', padding: '0.5rem', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
        {[
          { label: 'B', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
          { label: 'I', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
          { label: 'S', action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike') },
          { label: 'H1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }) },
          { label: 'H2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
          { label: '• List', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
          { label: '1. List', action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
          { label: '{ }', action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive('code') },
          { label: '---', action: () => editor.chain().focus().setHorizontalRule().run(), active: false },
        ].map((b) => (
          <button key={b.label} onClick={b.action} style={{
            ...BTN_STYLE,
            background: b.active ? 'rgba(124,58,237,0.2)' : 'transparent',
            color: b.active ? '#a78bfa' : 'var(--color-muted)',
          }}>{b.label}</button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
