// @ts-ignore
import { useEditor, EditorContent } from '@tiptap/react';
// @ts-ignore
import StarterKit from '@tiptap/starter-kit';
// @ts-ignore
import Image from '@tiptap/extension-image';
// @ts-ignore
import Link from '@tiptap/extension-link';
// @ts-ignore
import Underline from '@tiptap/extension-underline';
import { useCallback, useEffect, useRef, useState } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className = '' }: RichTextEditorProps) {
    const renderCountRef = useRef(0);
    const lastValueRef = useRef(value);
    const isInternalUpdateRef = useRef(false);
    const initStartRef = useRef(performance.now());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    // @ts-ignore
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Underline,
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Link.configure({
                openOnClick: false,
            }),
        ],
        content: value,
        // @ts-ignore
        onUpdate: ({ editor }) => {
            const updateStart = performance.now();
            isInternalUpdateRef.current = true;
            
            const getHtmlStart = performance.now();
            const html = editor.getHTML();
            console.log(`[RichTextEditor] getHTML: ${(performance.now() - getHtmlStart).toFixed(2)}ms`);
            
            lastValueRef.current = html;
            onChange(html);
            console.log(`[RichTextEditor] onUpdate total: ${(performance.now() - updateStart).toFixed(2)}ms`);
        },
        editorProps: {
            attributes: {
                class: 'focus:outline-none min-h-[200px] p-3 text-gray-900 dark:text-white',
                'data-placeholder': placeholder || 'Saisissez votre contenu...',
            },
        },
    });

    // Log de l'initialisation
    useEffect(() => {
        if (editor) {
            const initTime = performance.now() - initStartRef.current;
            console.log(`[RichTextEditor] Initialization: ${initTime.toFixed(2)}ms`);
        }
    }, [editor]);

    // Mettre à jour l'éditeur quand la valeur externe change
    useEffect(() => {
        const effectStart = performance.now();
        
        if (isInternalUpdateRef.current) {
            isInternalUpdateRef.current = false;
            console.log(`[RichTextEditor] useEffect skipped (internal update): ${(performance.now() - effectStart).toFixed(2)}ms`);
            return;
        }

        if (editor && value !== lastValueRef.current) {
            if (value === editor.getHTML()) {
                lastValueRef.current = value;
                console.log(`[RichTextEditor] useEffect skipped (same HTML): ${(performance.now() - effectStart).toFixed(2)}ms`);
                return;
            }
            
            const setContentStart = performance.now();
            editor.commands.setContent(value);
            console.log(`[RichTextEditor] setContent: ${(performance.now() - setContentStart).toFixed(2)}ms`);
            lastValueRef.current = value;
        }
        console.log(`[RichTextEditor] useEffect total: ${(performance.now() - effectStart).toFixed(2)}ms`);
    }, [value, editor]);

    // Log du nombre de renders
    renderCountRef.current += 1;
    console.log(`[RichTextEditor] Render #${renderCountRef.current}`);

    const setHeading = useCallback((level: 1 | 2 | 3) => {
        editor?.chain().focus().toggleHeading({ level }).run();
    }, [editor]);

    const toggleBold = useCallback(() => {
        editor?.chain().focus().toggleBold().run();
    }, [editor]);

    const toggleItalic = useCallback(() => {
        editor?.chain().focus().toggleItalic().run();
    }, [editor]);

    const toggleUnderline = useCallback(() => {
        editor?.chain().focus().toggleUnderline().run();
    }, [editor]);

    const toggleBulletList = useCallback(() => {
        editor?.chain().focus().toggleBulletList().run();
    }, [editor]);

    const toggleOrderedList = useCallback(() => {
        editor?.chain().focus().toggleOrderedList().run();
    }, [editor]);

    const setLink = useCallback(() => {
        const url = window.prompt('URL du lien:');
        if (url) {
            editor?.chain().focus().setLink({ href: url }).run();
        }
    }, [editor]);

    const setImage = useCallback(() => {
        const url = window.prompt('URL de l\'image:');
        if (url) {
            editor?.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    const handleImageUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            setIsUploading(true);
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
            // Upload d'image désactivé - fonctionnalité actualités supprimée
            const response = await fetch('/dashboard/upload-image', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': token,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            if (data?.url) {
                editor?.chain().focus().setImage({ src: data.url }).run();
            }
        } catch (error) {
            console.error('Erreur upload image', error);
            alert('Erreur lors du téléchargement de l’image.');
        } finally {
            setIsUploading(false);
            event.target.value = '';
        }
    };

    if (!editor) {
        return null;
    }

    return (
        <div className={`border border-gray-300 dark:border-gray-600 rounded-md ${className}`}>
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-t-md">
                <button
                    type="button"
                    onClick={toggleBold}
                    className={`px-2 py-1 text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-600 rounded ${editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
                    title="Gras"
                >
                    <strong>B</strong>
                </button>
                <button
                    type="button"
                    onClick={toggleItalic}
                    className={`px-2 py-1 text-sm italic hover:bg-gray-200 dark:hover:bg-gray-600 rounded ${editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
                    title="Italique"
                >
                    <em>I</em>
                </button>
                <button
                    type="button"
                    onClick={toggleUnderline}
                    className={`px-2 py-1 text-sm underline hover:bg-gray-200 dark:hover:bg-gray-600 rounded ${editor.isActive('underline') ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
                    title="Souligné"
                >
                    <u>U</u>
                </button>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                <button
                    type="button"
                    onClick={() => setHeading(1)}
                    className={`px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
                    title="Titre 1"
                >
                    H1
                </button>
                <button
                    type="button"
                    onClick={() => setHeading(2)}
                    className={`px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
                    title="Titre 2"
                >
                    H2
                </button>
                <button
                    type="button"
                    onClick={() => setHeading(3)}
                    className={`px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
                    title="Titre 3"
                >
                    H3
                </button>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                <button
                    type="button"
                    onClick={toggleBulletList}
                    className={`px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 rounded ${editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
                    title="Liste à puces"
                >
                    •
                </button>
                <button
                    type="button"
                    onClick={toggleOrderedList}
                    className={`px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 rounded ${editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
                    title="Liste numérotée"
                >
                    1.
                </button>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                <button
                    type="button"
                    onClick={setLink}
                    className={`px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 rounded ${editor.isActive('link') ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
                    title="Lien"
                >
                    🔗
                </button>
                <button
                    type="button"
                    onClick={setImage}
                    className="px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    title="Image"
                >
                    🖼️
                </button>
                <button
                    type="button"
                    onClick={handleImageUploadClick}
                    disabled={isUploading}
                    className="px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50"
                    title="Téléverser une image"
                >
                    {isUploading ? 'Upload…' : '📁'}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                />
            </div>

            {/* Editor */}
            <div className="bg-white dark:bg-gray-800 rounded-b-md">
                <EditorContent 
                    editor={editor}
                    className="tiptap-editor"
                />
            </div>
            
            <style>{`
                .tiptap-editor .ProseMirror {
                    outline: none;
                    min-height: 200px;
                    padding: 12px;
                    white-space: pre-wrap;
                }
                .tiptap-editor .ProseMirror p {
                    margin: 0.5em 0;
                }
                .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #9ca3af;
                    pointer-events: none;
                    height: 0;
                }
                .tiptap-editor .ProseMirror h1 {
                    font-size: 2.5rem;
                    line-height: 1.2;
                    font-weight: 800;
                    margin: 1rem 0 0.75rem;
                }
                .tiptap-editor .ProseMirror h2 {
                    font-size: 2rem;
                    line-height: 1.25;
                    font-weight: 700;
                    margin: 0.85rem 0 0.65rem;
                }
                .tiptap-editor .ProseMirror h3 {
                    font-size: 1.5rem;
                    line-height: 1.3;
                    font-weight: 600;
                    margin: 0.75rem 0 0.5rem;
                }
                .tiptap-editor .ProseMirror ul,
                .tiptap-editor .ProseMirror ol {
                    padding-left: 1.5em;
                    margin: 0.5em 0;
                }
                .tiptap-editor .ProseMirror li {
                    margin: 0.25em 0;
                }
                .tiptap-editor .ProseMirror a {
                    color: #3b82f6;
                    text-decoration: underline;
                }
                .tiptap-editor .ProseMirror a:hover {
                    color: #2563eb;
                }
                .tiptap-editor .ProseMirror img {
                    max-width: 100%;
                    height: auto;
                    margin: 0.5em 0;
                }
                .dark .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
                    color: #6b7280;
                }
            `}</style>
        </div>
    );
}
