"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageResize from "tiptap-extension-resize-image";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import FontFamily from "@tiptap/extension-font-family";
import TextStyle from "@tiptap/extension-text-style";
import { Underline } from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { FontSizeExtension } from "@/extensions/font-size";
import { LineHeightExtension } from "@/extensions/line-height";
import { useEffect } from "react";
import { LoaderIcon } from "lucide-react";
import { LEFT_MARGIN_DEFAULT, RIGHT_MARGIN_DEFAULT } from "@/constants/margins";

interface Props {
  token: string;
}

export const ReadOnlyDocument = ({ token }: Props) => {
  const document = useQuery(api.documents.getByShareToken, { token });

  const previewEditor = useEditor({
    editable: false,
    immediatelyRender: false, // Prevents Next.js SSR from stripping complex nodes like images
    editorProps: {
      attributes: {
        class: "focus:outline-none w-full h-full",
      },
    },
    extensions: [
      StarterKit,
      ImageResize,
      Table, TableCell, TableHeader, TableRow,
      TaskList, TaskItem.configure({ nested: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Color, Highlight.configure({ multicolor: true }),
      FontFamily, TextStyle, Underline,
      Link.configure({ openOnClick: false, defaultProtocol: "https" }),
      FontSizeExtension,
      LineHeightExtension.configure({ types: ["heading", "paragraph"], defaultLineHeight: "normal" }),
    ],
    content: "",
  });

  useEffect(() => {
    if (previewEditor && document?.initialContent) {
      try {
        const parsedContent = typeof document.initialContent === "string" 
            ? JSON.parse(document.initialContent) 
            : document.initialContent;
            
        previewEditor.commands.setContent(parsedContent);
      } catch (err) {
        console.error("Failed to parse document content:", err);
      }
    }
  }, [document, previewEditor]);

  if (document === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFBFD]">
        <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (document === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFBFD]">
        <p className="text-muted-foreground">Document not found or private.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFD] pt-10 pb-10">
      <div className="flex justify-center">
        {/* Added 'tiptap' class below to enforce Table and Image CSS rules */}
        <div 
          className="bg-white border border-[#C7C7C7] flex flex-col min-h-[1054px] w-[816px] pt-10 pb-10 shadow-sm tiptap"
          style={{ paddingLeft: LEFT_MARGIN_DEFAULT, paddingRight: RIGHT_MARGIN_DEFAULT }}
        >
          <EditorContent editor={previewEditor} />
        </div>
      </div>
    </div>
  );
};