"use client";

import { useRef, useEffect } from "react";

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
import { useEditor, EditorContent } from "@tiptap/react";
import { Underline } from "@tiptap/extension-underline";

import { useLiveblocksExtension } from "@liveblocks/react-tiptap";
import { useStorage } from "@liveblocks/react";

import { useEditorStore } from "@/store/use-editor-store";
import { FontSizeExtension } from "@/extensions/font-size";
import { LineHeightExtension } from "@/extensions/line-height";

import { Ruler } from "./Ruler";
import { Threads } from "./threads";
import {
  LEFT_MARGIN_DEFAULT,
  RIGHT_MARGIN_DEFAULT,
} from "@/constants/margins";

import { Editor as TiptapEditor } from "@tiptap/core";
import { Transaction } from "@tiptap/pm/state"; // ✅ FIX: Added correct type import

import { JSONContent } from "@/types/editor";

import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

declare global {
  interface Window {
    editorInstance: TiptapEditor | null;
  }
}

interface EditorProps {
  initialContent?: JSONContent;
  documentId: Id<"documents">;
}

export const Editor = ({ initialContent, documentId }: EditorProps) => {
  const initialized = useRef(false);

  const leftMargin =
    useStorage((root) => root.leftMargin) ?? LEFT_MARGIN_DEFAULT;

  const rightMargin =
    useStorage((root) => root.rightMargin) ?? RIGHT_MARGIN_DEFAULT;

  const liveblocks = useLiveblocksExtension({
    initialContent: undefined,
    offlineSupport_experimental: true,
  });

  const { setEditor } = useEditorStore();

  const editor = useEditor({
    immediatelyRender: false,

    onCreate({ editor }) {
      window.editorInstance = editor;
      setEditor(editor);

      if (!initialized.current && initialContent) {
        initialized.current = true;

        setTimeout(() => {
          if (editor.isEmpty) {
            editor.commands.setContent(initialContent);
          }
        }, 200);
      }
    },

    onDestroy() {
      setEditor(null);
    },

    onUpdate({ editor }) {
      setEditor(editor);
    },

    onSelectionUpdate({ editor }) {
      setEditor(editor);
    },

    onTransaction({ editor }) {
      setEditor(editor);
    },

    onFocus({ editor }) {
      setEditor(editor);
    },

    onBlur({ editor }) {
      setEditor(editor);
    },

    onContentError({ editor }) {
      setEditor(editor);
    },

    editorProps: {
      attributes: {
        style: `padding-left: ${leftMargin}px; padding-right: ${rightMargin}px;`,
        class:
          "focus:outline-none print:border=0 bg-white border border-[#C7C7C7] flex flex-col min-h-[1054px] w-[816px] pt-10 pr-14 pb-10 cursor-text",
      },
    },

    extensions: [
      liveblocks,

      StarterKit.configure({
        history: false,
      }),

      LineHeightExtension.configure({
        types: ["heading", "paragraph"],
        defaultLineHeight: "normal",
      }),

      FontSizeExtension,

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),

      Link.configure({
        openOnClick: false,
        defaultProtocol: "https",
      }),

      Color,

      Highlight.configure({
        multicolor: true,
      }),

      FontFamily,
      TextStyle,
      Underline,
      ImageResize,

      Table,
      TableCell,
      TableHeader,
      TableRow,

      TaskItem.configure({
        nested: true,
      }),

      TaskList,
    ],
  });

  const pendingChanges = useRef(0);
  const lastSaveTime = useRef(Date.now());
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const createVersion = useMutation(api.documents.createVersion);

  const STEP_THRESHOLD = 120;
  const TIME_THRESHOLD = 5 * 60 * 1000;
  const IDLE_TIME = 3000;

  useEffect(() => {
    if (!editor) return;

    // ✅ FIX: Replaced 'any' with the correct 'Transaction' type
    const handleUpdate = ({ transaction }: { transaction: Transaction }) => {
      // 1. Ignore if no actual content changed
      if (!transaction.docChanged) return;

      // 2. 🔥 THE RACE CONDITION FIX: 
      // If the change came from Liveblocks (another user), ignore it. 
      // Only the user actively typing should trigger their local auto-save timer.
      if (transaction.getMeta("liveblocks")) return;

      pendingChanges.current++;

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(async () => {
        const now = Date.now();

        if (pendingChanges.current === 0) return;

        const shouldSaveBySteps = pendingChanges.current >= STEP_THRESHOLD;
        const shouldSaveByTime = now - lastSaveTime.current >= TIME_THRESHOLD;

        if (shouldSaveBySteps || shouldSaveByTime) {
          if (!editor) return;

          await createVersion({
            documentId,
            content: editor.getJSON(),
            isAuto: true,
          });

          pendingChanges.current = 0;
          lastSaveTime.current = now;

          console.log("✅ Auto version saved by active user");
        }
      }, IDLE_TIME);
    };

    editor.on("update", handleUpdate);

    const handleManualSaveReset = () => {
      pendingChanges.current = 0;
      lastSaveTime.current = Date.now();
      console.log("🔄 Auto-save counters reset due to Manual Save.");
    };

    window.addEventListener("manual-save-triggered", handleManualSaveReset);

    return () => {
      editor.off("update", handleUpdate);
      window.removeEventListener("manual-save-triggered", handleManualSaveReset);
    };
  }, [editor, documentId]);

  return (
    <div className="size-full overflow-x-auto bg-[#F9FBFD] px-4 print:p-0 print:bg-white print:overflow-visible">
      <Ruler />

      <div className="min-w-max flex justify-center w-[816px] py-4 print:py-0 mx-auto print:w-full print:min-w-0">
        <EditorContent editor={editor} />
        <Threads editor={editor} />
      </div>
    </div>
  );
};