"use client";

import { useState } from "react";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import AIChatPanel from "@/components/ai/ai-chat-panel";
import { PreviewSidePanel } from "@/components/preview-side-panel";
import { Toolbar } from "./Toolbar";
import { Editor } from "./Editor";
import { Navbar } from "./navbar";
import { Room } from "./room";
import { useEditorStore } from "@/store/use-editor-store";

interface DocumentProps {
  preloadedDocument: Preloaded<typeof api.documents.getById>;
}

export const Document = ({ preloadedDocument }: DocumentProps) => {
  const document = usePreloadedQuery(preloadedDocument);
  const { editor } = useEditorStore();
  
  const [activePanel, setActivePanel] = useState<"ai" | "preview" | null>(null);

  return (
    <Room>
      <div className="min-h-screen bg-[#FAFBFD]">
        <div className="flex flex-col px-4 pt-4 gap-y-2 fixed top-0 left-0 right-0 z-10 bg-[#FAFBFD] print:hidden">
          <Navbar data={document} />

          <Toolbar 
            onAiClick={() => setActivePanel(prev => prev === "ai" ? null : "ai")} 
            onPreviewClick={() => setActivePanel(prev => prev === "preview" ? null : "preview")}
          />
        </div>

        <div className="pt-[122px] print:pt-0 flex">
          
          {activePanel === "ai" && (
            <div className="w-[450px] border-r h-[calc(100vh-122px)] sticky top-[122px] bg-white shrink-0 shadow-lg">
              <AIChatPanel onClose={() => setActivePanel(null)} />
            </div>
          )}
          {activePanel === "preview" && (
            <div className="w-[450px] border-r h-[calc(100vh-122px)] sticky top-[122px] bg-white shrink-0 shadow-lg">
              <PreviewSidePanel editor={editor} onClose={() => setActivePanel(null)} />
            </div>
          )}

          <div className="flex-1 overflow-auto">
            <Editor 
              initialContent={document.initialContent} 
              documentId={document._id}
            />
          </div>
        </div>
      </div>
    </Room>
  );
};