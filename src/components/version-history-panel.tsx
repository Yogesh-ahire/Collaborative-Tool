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
  const [selectedVersion, setSelectedVersion] =
    useState<Doc<"document_versions"> | null>(null);

  const others = useOthers();
  const hasOtherUsers = others.length > 0;

  const previewEditor = useEditor({
    editable: false,
    extensions: [StarterKit],
    content: "",
  });

  useEffect(() => {
    if (previewEditor && selectedVersion?.content) {
      previewEditor.commands.setContent(selectedVersion.content);
    }
  }, [selectedVersion, previewEditor]);

  if (!versions) return null;

  return (
    <>
      {/* MAIN POPUP */}
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
          </DialogHeader>

          {/* SAVE VERSION */}
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
                  content: editor.getJSON(),
                  versionName,
                });

                setVersionName("");
                toast.success("Version saved");
              }}
              className="w-full"
            >
              Save Version
            </Button>
          </div>

          {/* VERSION LIST */}
          <div className="max-h-[200px] overflow-auto space-y-2 mt-4">
            {versions.map((v) => (
              <div
                key={v._id}
                className="border p-2 rounded cursor-pointer hover:bg-gray-100"
                onClick={() => setSelectedVersion(v)}
              >
                <p className="font-medium">
                  {v.versionName || `Version ${v.versionNumber}`}
                </p>

                <p className="text-xs text-muted-foreground">
                  {new Date(v.createdAt).toLocaleString()}
                </p>

                <p className="text-xs">by {v.createdBy}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* PREVIEW POPUP */}
      {selectedVersion && (
        <Dialog open={true} onOpenChange={() => setSelectedVersion(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {selectedVersion.versionName || "Untitled Version"}
              </DialogTitle>
            </DialogHeader>

            {/* METADATA */}
            <div className="text-sm text-muted-foreground space-y-1 mb-3">
              <p><b>Version:</b> {selectedVersion.versionNumber}</p>
              <p><b>Created By:</b> {selectedVersion.createdBy}</p>
              <p>
                <b>Date:</b>{" "}
                {new Date(selectedVersion.createdAt).toLocaleString()}
              </p>
            </div>

            {/* PREVIEW */}
            <div className="border p-4 max-h-[400px] overflow-auto bg-white rounded">
              {previewEditor && <EditorContent editor={previewEditor} />}
            </div>

            <DialogFooter>
              <Button
                onClick={() => {
                  const editor = window.editorInstance;

                  // ❌ CASE 1: Editor not ready
                  if (!editor) {
                    toast.error("Editor not ready. Try again.");
                    return;
                  }

                  // ❌ CASE 2: Empty content
                  if (!selectedVersion?.content) {
                    toast.error("This version has no content.");
                    return;
                  }

                  // ⚠️ CASE 3: Large content warning
                  const contentSize = JSON.stringify(selectedVersion.content).length;

                  if (contentSize > 50000) {
                    const confirmLarge = confirm(
                      "⚠️ This version is large and will be appended to your document.\nIt may affect performance.\nDo you want to continue?"
                    );
                    if (!confirmLarge) return;
                  }

                  // ⚠️ CASE 4: Multiple users warning
                  if (hasOtherUsers) {
                    const confirmUsers = confirm(
                      "⚠️ Other users are editing this document.\nThis will APPEND content at the End.\nDo you want to continue?"
                    );
                    if (!confirmUsers) return;
                  }else{

                  // ✅ FINAL INFO CONFIRM (clear UX)
                  const confirmFinal = confirm(
                    "This will INSERT the selected version into your document.\nExisting content will NOT be replaced.\n\nContinue?"
                  );

                  if (!confirmFinal) return;
                }
                  // ✅ SAFE INSERT
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
                      selectedVersion.content,
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