"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id, Doc } from "../../convex/_generated/dataModel";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageResize from "tiptap-extension-resize-image";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";

// 🔥 FIX: Imported all missing rich-text extensions to prevent blank previews
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import FontFamily from "@tiptap/extension-font-family";
import TextStyle from "@tiptap/extension-text-style";
import { Underline } from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { FontSizeExtension } from "@/extensions/font-size";
import { LineHeightExtension } from "@/extensions/line-height";

import { Editor } from "@tiptap/core";
import { toast } from "sonner";
import { useOthers } from "@liveblocks/react";

declare global {
  interface Window {
    editorInstance: Editor | null;
  }
}

interface Props {
  documentId: Id<"documents">;
  onClose: () => void;
}

export const VersionHistoryPanel = ({ documentId, onClose }: Props) => {
  const versions = useQuery(api.documents.getVersions, { documentId });
  const createVersion = useMutation(api.documents.createVersion);

  const [versionName, setVersionName] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedVersion, setSelectedVersion] = useState<any | null>(null);
  
  const [activeTab, setActiveTab] = useState<"manual" | "auto">("manual");

  const others = useOthers();
  const hasOtherUsers = others.length > 0;

  const previewEditor = useEditor({
    editable: false,
    extensions: [
      StarterKit,
      ImageResize,
      Table,
      TableCell,
      TableHeader,
      TableRow,
      TaskList,
      TaskItem.configure({ nested: true }),
      // 🔥 FIX: Registered all extensions here so Tiptap doesn't drop formatted text
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily,
      TextStyle,
      Underline,
      Link.configure({ openOnClick: false, defaultProtocol: "https" }),
      FontSizeExtension,
      LineHeightExtension.configure({ types: ["heading", "paragraph"], defaultLineHeight: "normal" }),
    ],
    content: "",
  });

  useEffect(() => {
    if (previewEditor && selectedVersion?.content) {
      try {
        const parsedContent = typeof selectedVersion.content === "string" 
            ? JSON.parse(selectedVersion.content) 
            : selectedVersion.content;
            
        previewEditor.commands.setContent(parsedContent);
      } catch (err) {
        console.error("Failed to parse version content:", err);
      }
    }
  }, [selectedVersion, previewEditor]);

  if (!versions) return null;

  const manualVersions = versions.filter((v: Doc<"document_versions">) => !v.isAuto);
  const autoVersions = versions.filter((v: Doc<"document_versions">) => v.isAuto);
  const displayVersions = activeTab === "manual" ? manualVersions : autoVersions;

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
          </DialogHeader>

          {activeTab === "manual" && (
            <div className="space-y-2">
              <Input
                placeholder="Enter version name..."
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
              />

              <Button
                onClick={async () => {
                  if (!versionName) return;

                  const editor = window.editorInstance;
                  if (!editor) return;

                  await createVersion({
                    documentId,
                    content: JSON.stringify(editor.getJSON()),
                    versionName,
                    isAuto: false,
                  });

                  setVersionName("");
                  window.dispatchEvent(new Event("manual-save-triggered"));
                  toast.success("Version saved");
                }}
                className="w-full"
              >
                Save Version
              </Button>
            </div>
          )}

          <div className="flex gap-2 mt-4 bg-gray-100 p-1 rounded-md">
            <button
              onClick={() => setActiveTab("manual")}
              className={`flex-1 text-sm py-1.5 rounded-sm font-medium transition-colors ${
                activeTab === "manual" ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"
              }`}
            >
              Manual Saves ({manualVersions.length})
            </button>
            <button
              onClick={() => setActiveTab("auto")}
              className={`flex-1 text-sm py-1.5 rounded-sm font-medium transition-colors ${
                activeTab === "auto" ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"
              }`}
            >
              Auto Saves ({autoVersions.length})
            </button>
          </div>

          <div className="max-h-[200px] min-h-[150px] overflow-auto space-y-2 mt-2">
            {displayVersions.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground pt-4">
                No {activeTab} versions found.
              </p>
            ) : (
              displayVersions.map((v: Doc<"document_versions">) => (
                <div
                  key={v._id}
                  className="border p-2 rounded cursor-pointer hover:bg-gray-100 flex flex-col"
                  onClick={() => setSelectedVersion(v)}
                >
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">
                      {v.versionName || (v.isAuto ? "Auto Recovery Snapshot" : `Version ${v.versionNumber}`)}
                    </p>
                    {v.isAuto && (
                      <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                        AUTO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(v.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">by {v.createdBy}</p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {selectedVersion && (
        <Dialog open={true} onOpenChange={() => setSelectedVersion(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {selectedVersion.versionName || (selectedVersion.isAuto ? "Auto Snapshot" : "Untitled Version")}
              </DialogTitle>
            </DialogHeader>

            <div className="text-sm text-muted-foreground space-y-1 mb-3 flex gap-4">
              <p><b>Version:</b> {selectedVersion.versionNumber}</p>
              <p><b>Created By:</b> {selectedVersion.createdBy}</p>
              <p>
                <b>Date:</b>{" "}
                {new Date(selectedVersion.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="border p-4 max-h-[400px] overflow-auto bg-white rounded tiptap">
              {previewEditor && <EditorContent editor={previewEditor} />}
            </div>

            <DialogFooter>
              <Button
                onClick={() => {
                  const editor = window.editorInstance;

                  if (!editor) {
                    toast.error("Editor not ready. Try again.");
                    return;
                  }

                  if (!selectedVersion?.content) {
                    toast.error("This version has no content.");
                    return;
                  }

                  const rawContent = typeof selectedVersion.content === "string" 
                      ? JSON.parse(selectedVersion.content) 
                      : selectedVersion.content;

                  if (hasOtherUsers) {
                    const confirmUsers = confirm(
                      "⚠️ Other users are editing this document.\nThis will APPEND content at the End.\nDo you want to continue?"
                    );
                    if (!confirmUsers) return;
                  }

                  // 🔥 FIX: Extract the actual content array to prevent nested document crashing
                  const contentToInsert = rawContent.type === "doc" ? rawContent.content : rawContent;

                  editor
                    .chain()
                    .focus()
                    .insertContent([
                      {
                        type: "paragraph",
                        content: [
                          {
                            type: "text",
                            text: `\n----- Restored Version (v${selectedVersion.versionNumber}) -----\n`,
                          },
                        ],
                      },
                      ...(Array.isArray(contentToInsert) ? contentToInsert : [contentToInsert]),
                      {
                        type: "paragraph",
                        content: [
                          {
                            type: "text",
                            text: `\n----- End Restored Version -----\n`,
                          },
                        ],
                      },
                    ])
                    .run();

                  setSelectedVersion(null);
                  toast.success("Version inserted safely");
                }}
              >
                Insert Version
              </Button>

              <Button
                variant="outline"
                onClick={() => setSelectedVersion(null)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};