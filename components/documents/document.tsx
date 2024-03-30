'use client'
import {BubbleMenu, EditorContent, FloatingMenu, useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {saveDocument} from "@/app/actions/documents";
import {WithId, Document} from "mongodb";
import { Markdown } from 'tiptap-markdown';

// define your extension array
const extensions = [
    StarterKit,
    Markdown
]

interface DocumentProps {
    content: string
    documentId: string
    userId: string
}


export default function Document({content, documentId, userId}: DocumentProps) {
    const editor = useEditor({
        extensions,
        content,
        onUpdate: async ({editor}) => {
            const content = editor.getHTML();
            await saveDocument({content, documentId, userId})
        },
    })

    if (!editor) return null


    return (
        <div className="flex p-4">
            <EditorContent editor={editor} className="border h-3/4 overflow-scroll "/>
            {/*<FloatingMenu editor={editor}>This is the floating menu</FloatingMenu>*/}
            {/*<BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu>*/}
        </div>
    )
}