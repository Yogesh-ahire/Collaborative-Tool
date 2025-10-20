"use client";

import{ useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export const Editor = () => {
    const editor = useEditor({
        extensions: [StarterKit],
        content: '<p> Hellow world! 🌍</p>',
    })

    return ( 
        <div>
            <EditorContent editor={editor} />  
        </div>
     );
};
 
