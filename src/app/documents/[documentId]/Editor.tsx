"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { DOMSerializer } from "@tiptap/pm/model"; 

import StarterKit from "@tiptap/starter-kit";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import ImageResize from "tiptap-extension-resize-image";
import Table from "@tiptap/extension-table";
import FontFamily from "@tiptap/extension-font-family";
import TextStyle from "@tiptap/extension-text-style";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import { Underline } from "@tiptap/extension-underline";

import { useLiveblocksExtension } from "@liveblocks/react-tiptap";
import { useStorage } from "@liveblocks/react";

import { useEditorStore } from "@/store/use-editor-store";
import { FontSizeExtension } from "@/extensions/font-size";
import { LineHeightExtension } from "@/extensions/line-height";

import { Ruler } from "./Ruler";
import { Threads } from "./threads";
import { LEFT_MARGIN_DEFAULT, RIGHT_MARGIN_DEFAULT } from "@/constants/margins";

import { Transaction } from "@tiptap/pm/state";
import { JSONContent } from "@/types/editor";

import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Sparkles, SpellCheck2, Loader2, XIcon, ChevronDown } from "lucide-react";

interface EditorProps {
  initialContent?: JSONContent | string; 
  documentId: Id<"documents">;
}

const TONES = ["Professional", "Friendly", "Confident", "Casual", "Happy", "Direct"];
const LANGUAGES = ["Arabic", "Chinese", "French", "German", "Hindi", "Italian", "Japanese", "Portuguese", "Russian", "Spanish"];

export const Editor = ({ initialContent, documentId }: EditorProps) => {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState<{ html: string; from: number; to: number } | null>(null);
  const [aiProcessingRange, setAiProcessingRange] = useState<{from: number, to: number} | null>(null);

  const leftMargin = useStorage((root) => root.leftMargin) ?? LEFT_MARGIN_DEFAULT;
  const rightMargin = useStorage((root) => root.rightMargin) ?? RIGHT_MARGIN_DEFAULT;

  const parsedContent = useMemo(() => {
    if (!initialContent) return undefined;
    if (typeof initialContent === "string") {
      try {
        return JSON.parse(initialContent);
      } catch (e) {
        console.log(e);
        return initialContent; 
      }
    }
    return initialContent;
  }, [initialContent]);

  const liveblocks = useLiveblocksExtension({
    initialContent: parsedContent,
  });

  const { setEditor } = useEditorStore();

  const editor = useEditor({
    immediatelyRender: false,
    onCreate({ editor }) { 
      setEditor(editor); 
    },
    onDestroy() { setEditor(null); },
    onUpdate({ editor }) { setEditor(editor); },
    onSelectionUpdate({ editor }) { setEditor(editor); },
    onTransaction({ editor }) { setEditor(editor); },
    onFocus({ editor }) { setEditor(editor); },
    onBlur({ editor }) { setEditor(editor); },
    onContentError({ editor }) { setEditor(editor); },

    editorProps: {
      attributes: {
        style: `padding-left: ${leftMargin}px; padding-right: ${rightMargin}px;`,
        class: "focus:outline-none print:border=0 bg-white border border-[#C7C7C7] flex flex-col min-h-[1054px] w-[816px] pt-10 pr-14 pb-10 cursor-text",
      },
    },

    extensions: [
      liveblocks,
      StarterKit.configure({ history: false }),
      LineHeightExtension.configure({ types: ["heading", "paragraph"], defaultLineHeight: "normal" }),
      FontSizeExtension,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, defaultProtocol: "https" }),
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily,
      TextStyle,
      Underline,
      ImageResize,
      Table,
      TableCell,
      TableHeader,
      TableRow,
      TaskItem.configure({ nested: true }),
      TaskList,
    ],
  });

  const pendingChanges = useRef(0);
  const lastSaveTime = useRef(Date.now());
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const createVersion = useMutation(api.documents.createVersion);

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = ({ transaction }: { transaction: Transaction }) => {
      if (!transaction.docChanged) return;
      if (transaction.getMeta("liveblocks")) return;

      pendingChanges.current++;
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(async () => {
        const now = Date.now();
        if (pendingChanges.current === 0) return;

        if (pendingChanges.current >= 120 || now - lastSaveTime.current >= 300000) {
          try {
            await createVersion({
              documentId,
              content: JSON.stringify(editor.getJSON()),
              isAuto: true,
            });
            pendingChanges.current = 0;
            lastSaveTime.current = now;
          } catch (error) {
            console.error("Auto-save failed:", error);
          }
        }
      }, 3000);
    };

    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [editor, documentId]);

  const handleAiAction = async (action: "grammar" | "tone" | "translate", modifier?: string) => {
    if (!editor) return;
    
    const { from, to } = editor.state.selection;
    
    const slice = editor.state.doc.slice(from, to);
    const serializer = DOMSerializer.fromSchema(editor.schema);
    const documentFragment = serializer.serializeFragment(slice.content);
    
    const tempDiv = document.createElement("div");
    tempDiv.appendChild(documentFragment);
    const selectedHTML = tempDiv.innerHTML;
    
    if (!selectedHTML.trim()) return;

    setAiProcessingRange({ from, to });
    editor.chain().setTextSelection({ from, to }).setHighlight({ color: "#e9d5ff" }).run();

    setIsAiLoading(true);
    const toastId = toast.loading("AI is generating your text...");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: selectedHTML, 
          action: action,
          modifier: modifier
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPreviewContent({
        html: data.result,
        from,
        to
      });
      
      toast.success("Preview ready!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate AI response", { id: toastId });
      
      if (editor) editor.chain().setTextSelection({ from, to }).unsetHighlight().run();
      setAiProcessingRange(null);
    } finally {
      setIsAiLoading(false);
    }
  };

  const acceptAiPreview = () => {
    if (previewContent && editor) {
      editor.chain()
        .focus()
        .setTextSelection({ from: previewContent.from, to: previewContent.to })
        .unsetHighlight()
        .insertContent(previewContent.html)
        .run();
        
      setPreviewContent(null);
      setAiProcessingRange(null);
    }
  };

  const discardAiPreview = () => {
    if (aiProcessingRange && editor) {
      editor.chain()
        .setTextSelection({ from: aiProcessingRange.from, to: aiProcessingRange.to })
        .unsetHighlight()
        .run();
    }
    setPreviewContent(null);
    setAiProcessingRange(null);
  };

  return (
    <div className="size-full overflow-x-auto bg-[#F9FBFD] px-4 print:p-0 print:bg-white print:overflow-visible relative">
      <Ruler />

      <div className="min-w-max flex justify-center w-[816px] py-4 print:py-0 mx-auto print:w-full print:min-w-0 relative">
        
        {editor && (
          <BubbleMenu 
            editor={editor} 
            tippyOptions={{ duration: 100, placement: 'top' }}
            className="flex items-center gap-1 p-1.5 bg-white border border-gray-200 shadow-xl rounded-lg"
          >
            <div className="flex items-center px-2 border-r border-gray-200">
               <Sparkles className="size-4 text-purple-600" />
            </div>
            
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleAiAction("grammar")}
              disabled={isAiLoading}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-md transition disabled:opacity-50"
            >
              {isAiLoading ? <Loader2 className="size-3 animate-spin" /> : <SpellCheck2 className="size-3" />}
              Fix Grammar
            </button>

            <div className="relative flex items-center group">
              <select 
                disabled={isAiLoading}
                onChange={(e) => {
                  if(e.target.value) handleAiAction("tone", e.target.value);
                  e.target.value = ""; 
                }}
                className="appearance-none bg-transparent hover:bg-gray-100 text-gray-700 font-medium text-xs px-2.5 py-1.5 pr-7 rounded-md outline-none cursor-pointer disabled:opacity-50 transition"
                defaultValue=""
              >
                <option value="" disabled>Change Tone</option>
                {TONES.map(tone => <option key={tone} value={tone}>{tone}</option>)}
              </select>
              <ChevronDown className="size-3 absolute right-2 pointer-events-none text-gray-500 group-hover:text-gray-700" />
            </div>

            <div className="relative flex items-center group">
              <select 
                disabled={isAiLoading}
                onChange={(e) => {
                  if(e.target.value) handleAiAction("translate", e.target.value);
                  e.target.value = ""; 
                }}
                className="appearance-none bg-transparent hover:bg-gray-100 text-gray-700 font-medium text-xs px-2.5 py-1.5 pr-7 rounded-md outline-none cursor-pointer disabled:opacity-50 transition"
                defaultValue=""
              >
                <option value="" disabled>Translate</option>
                {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
              </select>
              <ChevronDown className="size-3 absolute right-2 pointer-events-none text-gray-500 group-hover:text-gray-700" />
            </div>
          </BubbleMenu>
        )}

        <EditorContent editor={editor} />
        <Threads editor={editor} />
      </div>

      {previewContent && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 m-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Sparkles className="size-4 text-purple-600" />
                AI Preview
              </h3>
              <button onClick={discardAiPreview} className="p-1 hover:bg-gray-200 rounded-full transition">
                <XIcon className="size-4 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto bg-white">
              <div 
                className="max-w-none break-words space-y-2 [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:ml-4 [&_ol]:my-1 [&_strong]:font-bold [&_h3]:font-bold [&_h3]:text-base [&_h2]:font-bold [&_h2]:text-lg [&_p]:m-0 text-gray-700 text-sm" 
                dangerouslySetInnerHTML={{ __html: previewContent.html }} 
              />
            </div>
            
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={discardAiPreview}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Discard
              </button>
              <button 
                onClick={acceptAiPreview}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
              >
                Accept & Replace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};