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
import { Sparkles, LayoutDashboardIcon } from "lucide-react"; // 🔥 ADDED FAB ICONS

interface DocumentProps {
  preloadedDocument: Preloaded<typeof api.documents.getById>;
}

export const Document = ({ preloadedDocument }: DocumentProps) => {
  const document = usePreloadedQuery(preloadedDocument);
  const { editor } = useEditorStore();
  
  const [activePanel, setActivePanel] = useState<"ai" | "preview" | null>(null);

  return (
    <Room>
      <div className="min-h-screen bg-[#FAFBFD] relative">
        <div className="flex flex-col px-4 pt-4 gap-y-2 fixed top-0 left-0 right-0 z-10 bg-[#FAFBFD] print:hidden">
          <Navbar data={document} />

          {/* 🔥 Buttons still exist in the Toolbar */}
          <Toolbar 
            onAiClick={() => setActivePanel(prev => prev === "ai" ? null : "ai")} 
            onPreviewClick={() => setActivePanel(prev => prev === "preview" ? null : "preview")}
          />
        </div>

        <div className="pt-[122px] print:pt-0 flex">
          
          {activePanel === "ai" && (
            <div className="w-[450px] border-r h-[calc(100vh-122px)] sticky top-[122px] bg-white shrink-0 shadow-lg z-20">
              <AIChatPanel onClose={() => setActivePanel(null)} />
            </div>
          )}
          {activePanel === "preview" && (
            <div className="w-[450px] border-r h-[calc(100vh-122px)] sticky top-[122px] bg-white shrink-0 shadow-lg z-20">
              <PreviewSidePanel 
                editor={editor} 
                documentId = {document._id}
                onClose={() => setActivePanel(null)} 
                />
            </div>
          )}

          <div className="flex-1 overflow-auto">
            <Editor 
              initialContent={document.initialContent} 
              documentId={document._id}
            />
          </div>
        </div>

        {/* 🔥 FLOATING ACTION BUTTON WIDGET (Bottom Right) */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50 print:hidden">
            <button
                onClick={() => setActivePanel(prev => prev === "preview" ? null : "preview")}
                className={`h-12 w-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
                    activePanel === "preview" ? "bg-blue-700 text-white" : "bg-white text-blue-600 border border-gray-200 hover:bg-gray-50"
                }`}
                title="Document Insights & Preview"
            >
                <LayoutDashboardIcon className="size-5" />
            </button>
            
            <button
                onClick={() => setActivePanel(prev => prev === "ai" ? null : "ai")}
                className={`h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
                    activePanel === "ai" ? "bg-purple-700 text-white" : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
                title="DoczFlow AI Assistant"
            >
                <Sparkles className="size-6" />
            </button>
        </div>

      </div>
    </Room>
  );
};