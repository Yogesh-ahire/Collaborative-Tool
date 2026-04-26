"use client";

import { useState, useEffect } from "react";
import { XIcon, FileTextIcon, PieChartIcon, ActivityIcon } from "lucide-react";
import { extractRawCRDTData } from "@/lib/yjs-extractor";
import { useOthers, useSelf, useStorage } from "@liveblocks/react/suspense"; // 🔥 Added useStorage
import { LEFT_MARGIN_DEFAULT, RIGHT_MARGIN_DEFAULT } from "@/constants/margins"; // 🔥 Import your defaults

interface PreviewSidePanelProps {
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: any;
}

export const PreviewSidePanel = ({ onClose, editor }: PreviewSidePanelProps) => {
  const [activeTab, setActiveTab] = useState<"print" | "analytics">("print");
  const [stats, setStats] = useState<{ name: string; added: number; color: string; hex: string; clientId: string }[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rawCrdtData, setRawCrdtData] = useState<any>(null);

  // 🔥 FETCH MARGINS FROM LIVEBLOCKS STORAGE (Same as Editor)
  const leftMargin = useStorage((root) => root.leftMargin) ?? LEFT_MARGIN_DEFAULT;
  const rightMargin = useStorage((root) => root.rightMargin) ?? RIGHT_MARGIN_DEFAULT;

  const others = useOthers();
  const currentUser = useSelf();

  const colors = [
    { bg: "bg-blue-200", hex: "#93c5fd" },   
    { bg: "bg-emerald-200", hex: "#6ee7b7" },
    { bg: "bg-purple-200", hex: "#d8b4fe" }, 
    { bg: "bg-amber-200", hex: "#fcd34d" },  
    { bg: "bg-rose-200", hex: "#fda4af" }    
  ];

  useEffect(() => {
    if (activeTab === "analytics" && editor) {
      const data = extractRawCRDTData(editor);
      if (!data) return;
      setRawCrdtData(data);

      const newStats = [];
      let colorIndex = 0;
      for (const [clientId, info] of Object.entries(data.statistics)) {
        if (info.added > 0) {
          const isMe = currentUser.connectionId === Number(clientId);
          const otherUser = others.find((u) => u.connectionId === Number(clientId));
          const name = isMe ? "You" : (otherUser?.info?.name || `Session: ${clientId.slice(-4)}`);
          newStats.push({
            clientId, name, added: info.added,
            color: colors[colorIndex % colors.length].bg,
            hex: colors[colorIndex % colors.length].hex
          });
          colorIndex++;
        }
      }
      newStats.sort((a, b) => b.added - a.added);
      setStats(newStats);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, editor, others]);

  const totalAdded = stats.reduce((acc, curr) => acc + curr.added, 0);

  let currentPercentage = 0;
  const conicStops = stats.map(s => {
    const percentage = (s.added / totalAdded) * 100;
    const start = currentPercentage;
    const end = currentPercentage + percentage;
    currentPercentage = end;
    return `${s.hex} ${start}% ${end}%`;
  }).join(", ");

  const PAGE_HEIGHT_PX = 1054;
  const PAGE_GAP_PX = 15;
  const pageBreakBackgroundStyle = {
    backgroundSize: `100% ${PAGE_HEIGHT_PX + PAGE_GAP_PX}px`,
    backgroundImage: `repeating-linear-gradient(to bottom, #ffffff 0px, #ffffff ${PAGE_HEIGHT_PX}px, #cbd5e1 ${PAGE_HEIGHT_PX}px, #cbd5e1 ${PAGE_HEIGHT_PX + PAGE_GAP_PX}px)`,
    backgroundAttachment: 'local',
  };

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full bg-white relative shadow-inner border-l">
      <div className="px-4 py-3 border-b flex items-center justify-between bg-gray-50 shrink-0">
        <div className="flex items-center gap-2">
           <ActivityIcon className="size-4 text-blue-600" />
           <h3 className="font-semibold text-gray-800 text-sm">Document Insights</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition">
          <XIcon className="size-4 text-gray-500" />
        </button>
      </div>

      <div className="flex px-3 pt-3 shrink-0 border-b bg-white">
        <button onClick={() => setActiveTab("print")} className={`flex-1 flex items-center justify-center gap-2 pb-2 text-xs font-bold transition ${activeTab === "print" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-400 hover:text-gray-800"}`}>
          <FileTextIcon className="size-3.5" /> Content View
        </button>
        <button onClick={() => setActiveTab("analytics")} className={`flex-1 flex items-center justify-center gap-2 pb-2 text-xs font-bold transition ${activeTab === "analytics" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-400 hover:text-gray-800"}`}>
          <PieChartIcon className="size-3.5" /> CRDT Analytics
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-100">
        {activeTab === "print" ? (
          <div className="p-4 flex flex-col items-center">
            <div 
              className="bg-white shadow-2xl border border-gray-300 pointer-events-none origin-top"
              style={{ 
                width: '816px', 
                minHeight: '2108px', 
                transform: 'scale(0.35)', 
                marginBottom: '-1350px',
                ...pageBreakBackgroundStyle
              }}
            >
              <div 
                // 🔥 SYNCED MARGINS AND FIXED WHITE-SPACE
                style={{ paddingLeft: `${leftMargin}px`, paddingRight: `${rightMargin}px` }}
                className="max-w-none [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 break-words font-serif text-[18px] leading-relaxed pt-10 pb-10 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: editor.getHTML() }} 
              />
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-6">
            {!rawCrdtData ? (
              <p className="text-xs text-gray-400 text-center mt-10">Waiting for CRDT sync...</p>
            ) : (
              <>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Volume Distribution</h4>
                  <div className="flex items-center gap-6">
                    <div className="size-16 rounded-full shadow-inner shrink-0" style={{ background: `conic-gradient(${conicStops})` }} />
                    <div className="space-y-1.5 flex-1">
                      {stats.map((s, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full" style={{ backgroundColor: s.hex }} />
                            <span className="text-gray-700 font-medium truncate max-w-[90px]">{s.name}</span>
                          </div>
                          <span className="font-bold text-gray-900">{((s.added / totalAdded) * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Recent Operations Log</h4>
                  <div className="bg-white border border-gray-200 rounded-md p-3 shadow-inner h-[300px] overflow-auto">
                    <pre className="text-[10px] font-mono text-gray-600 leading-tight">
                        {/* 🔥 REVERSED TO SHOW LAST 100 RECENT OPERATIONS */}
                        {JSON.stringify([...rawCrdtData.rawNodes].reverse().slice(0, 100), (key, value) => 
                            typeof value === 'bigint' ? value.toString() : value, 
                        2)}
                    </pre>
                  </div>
                  <p className="text-[9px] text-gray-400 italic text-center">Showing 100 most recent binary operations</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};