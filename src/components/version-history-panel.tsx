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
import { LoaderIcon, XIcon } from "lucide-react";
import { LEFT_MARGIN_DEFAULT, RIGHT_MARGIN_DEFAULT } from "@/constants/margins";
import { Id } from "../../convex/_generated/dataModel";
// 🔥 FIX: Interface now accepts BOTH sets of props safely
interface Props {
  token?: string;
  documentId?: Id<"documents">;
  onClose?: () => void;
}

export const VersionHistoryPanel = ({ token, documentId, onClose }: Props) => {
  // We use "skip" to avoid calling the wrong query and breaking hook rules
  const docByToken = useQuery(api.documents.getByShareToken, token ? { token } : "skip");
  const docById = useQuery(api.documents.getById, documentId ? { id: documentId } : "skip");
  
  const document = token ? docByToken : docById;

  const previewEditor = useEditor({
    editable: false,
    immediatelyRender: false,
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
      // If it's an overlay, it needs absolute/fixed positioning and z-index
      <div className={`flex min-h-screen items-center justify-center bg-[#FAFBFD] ${onClose ? 'fixed inset-0 z-50' : ''}`}>
        <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (document === null) {
    return (
      <div className={`flex min-h-screen items-center justify-center bg-[#FAFBFD] ${onClose ? 'fixed inset-0 z-50' : ''}`}>
        <p className="text-muted-foreground">Document not found or private.</p>
        {onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-200 hover:bg-slate-300 rounded-full">
             <XIcon className="size-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    // 🔥 FIX: Converts to a full-screen modal overlay ONLY if `onClose` is passed from the Editor
    <div className={`min-h-screen bg-[#FAFBFD] pt-10 pb-10 ${onClose ? 'fixed inset-0 z-[99] overflow-y-auto' : ''}`}>
      
      {/* Renders the close button specifically for the Editor UI */}
      {onClose && (
        <button 
          onClick={onClose} 
          className="fixed top-6 right-6 z-[100] p-2.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-full transition shadow-sm"
        >
          <XIcon className="size-5" />
        </button>
      )}

      <div className="flex justify-center">
        <div 
          className="bg-white border border-[#C7C7C7] flex flex-col min-h-[1054px] w-[816px] pt-10 pb-10 shadow-sm tiptap relative"
          style={{ paddingLeft: LEFT_MARGIN_DEFAULT, paddingRight: RIGHT_MARGIN_DEFAULT }}
        >
          <EditorContent editor={previewEditor} />
        </div>
      </div>
    </div>
  );
};