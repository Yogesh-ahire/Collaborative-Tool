"use client";

import { useState, useEffect } from "react";
import { XIcon, FileTextIcon, PieChartIcon, ActivityIcon, HistoryIcon, UserCircle, HashIcon, SearchCode } from "lucide-react";
import { useStorage } from "@liveblocks/react/suspense";
import { LEFT_MARGIN_DEFAULT, RIGHT_MARGIN_DEFAULT } from "@/constants/margins";
import { getUsers } from "@/app/documents/[documentId]/actions";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface PreviewSidePanelProps {
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: any;
  documentId: Id<"documents">;
}

export const PreviewSidePanel = ({ onClose, editor, documentId }: PreviewSidePanelProps) => {
  const [activeTab, setActiveTab] = useState<"print" | "analytics">("print");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [clerkUsers, setClerkUsers] = useState<any[]>([]);

  const leftMargin = useStorage((root) => root.leftMargin) ?? LEFT_MARGIN_DEFAULT;
  const rightMargin = useStorage((root) => root.rightMargin) ?? RIGHT_MARGIN_DEFAULT;

  const telemetryData = useQuery(api.documents.getTelemetry, { documentId });

  const colors = [
    { bg: "bg-blue-100", border: "border-blue-200", text: "text-blue-700", hex: "#dbeafe" },
    { bg: "bg-emerald-100", border: "border-emerald-200", text: "text-emerald-700", hex: "#d1fae5" },
    { bg: "bg-purple-100", border: "border-purple-200", text: "text-purple-700", hex: "#f3e8ff" },
    { bg: "bg-amber-100", border: "border-amber-200", text: "text-amber-700", hex: "#fef3c7" },
    { bg: "bg-rose-100", border: "border-rose-200", text: "text-rose-700", hex: "#ffe4e6" },
    { bg: "bg-indigo-100", border: "border-indigo-200", text: "text-indigo-700", hex: "#e0e7ff" }
  ];

  useEffect(() => {
    getUsers().then(setClerkUsers).catch(err => console.error("Failed to fetch Clerk users:", err));
  }, []);

  const dbStats = telemetryData?.stats || [];
  const auditLogs = telemetryData?.auditLogs || [];
  const documentFlowBlocks = telemetryData?.documentFlowBlocks || [];
  const rawNodes = telemetryData?.rawNodes || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stats = dbStats.map((s: any, i: number) => {
    const clerkMatch = clerkUsers.find(u => u.id === s.id);
    return { ...s, name: clerkMatch ? clerkMatch.name : s.name, ...colors[i % colors.length] };
  });

  const totalAdded = stats.reduce((acc: number, curr: { added: number }) => acc + curr.added, 0);

  let currentPercentage = 0;
  const conicStops = stats.map((s: { added: number, hex: string }) => {
    const percentage = totalAdded > 0 ? (s.added / totalAdded) * 100 : 0;
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
      <div className="px-4 py-3 border-b flex items-center justify-between bg-slate-50 shrink-0">
        <div className="flex items-center gap-2"><ActivityIcon className="size-4 text-indigo-600" /><h3 className="font-bold text-slate-800 text-sm tracking-tight">Insights & Forensics</h3></div>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-md transition text-slate-500"><XIcon className="size-4" /></button>
      </div>

      <div className="flex px-3 pt-3 shrink-0 border-b bg-white">
        <button onClick={() => setActiveTab("print")} className={`flex-1 flex items-center justify-center gap-2 pb-2 text-xs font-bold transition border-b-2 ${activeTab === "print" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-700"}`}><FileTextIcon className="size-3.5" /> Content View</button>
        <button onClick={() => setActiveTab("analytics")} className={`flex-1 flex items-center justify-center gap-2 pb-2 text-xs font-bold transition border-b-2 ${activeTab === "analytics" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-700"}`}><PieChartIcon className="size-3.5" /> Forensics</button>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50">
        {activeTab === "print" ? (
          <div className="p-4 flex flex-col items-center">
            <div className="bg-white shadow-2xl border border-gray-300 pointer-events-none origin-top" style={{ width: '816px', minHeight: '2108px', transform: 'scale(0.35)', marginBottom: '-1350px', ...pageBreakBackgroundStyle }}>
              <div style={{ paddingLeft: `${leftMargin}px`, paddingRight: `${rightMargin}px` }} className="max-w-none [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 break-words font-serif text-[18px] leading-relaxed pt-10 pb-10 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-6">
            {!telemetryData ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400"><ActivityIcon className="size-8 animate-pulse mb-2 opacity-50" /><p className="text-xs font-medium">Fetching telemetry...</p></div>
            ) : (
              <>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2"><PieChartIcon className="size-3" /> Volume Distribution</h4>
                  <div className="flex flex-col gap-6">
                    <div className="size-24 rounded-full shadow-inner mx-auto ring-4 ring-slate-50" style={{ background: `conic-gradient(${conicStops})` }} />
                    <div className="space-y-2.5 flex-1">
                      {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        stats.map((s: any, i: number) => (
                          <div key={i} className={`flex items-center justify-between text-xs p-2 rounded-lg border ${s.bg} ${s.border}`}>
                            <div className="flex items-center gap-2"><UserCircle className={`size-4 ${s.text}`} /><span className={`font-semibold truncate max-w-[120px] ${s.text}`}>{s.name}</span></div>
                            <span className={`font-black ${s.text}`}>{((s.added / totalAdded) * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[400px]">
                  <div className="bg-slate-100 p-3 border-b border-slate-200 flex justify-between items-center"><h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><HashIcon className="size-3" /> Document Flow Map</h4></div>
                  <div className="p-3 border-b border-slate-100 bg-white flex flex-wrap gap-1.5 shrink-0">
                    {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      stats.map((s: any, i: number) => (
                        <div key={i} className={`px-2 py-0.5 rounded text-[9px] font-bold border ${s.bg} ${s.text} ${s.border}`}>{s.name}</div>
                      ))}
                  </div>
                  <div className="flex-1 overflow-auto p-4 bg-slate-50">
                    <div className="bg-white shadow-md border border-gray-200 rounded-lg mx-auto" style={{ width: '100%', maxWidth: '816px', minHeight: '100%', padding: '40px' }}>
                      <div className="break-words font-serif text-[15px] leading-loose whitespace-pre-wrap text-[#0f172a]">
                        {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          documentFlowBlocks.map((block: any, index: number) => {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const userStat = stats.find((s: any) => s.id === block.id);
                            const bgColor = userStat ? userStat.hex : "transparent";
                            return (
                              <span key={index} style={{ backgroundColor: bgColor }} className="rounded-[2px] px-[1px] mx-[2px] transition-colors inline-block">{block.text}</span>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[300px]">
                  <div className="bg-slate-100 p-3 border-b border-slate-200"><h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><HistoryIcon className="size-3" /> Event Audit Trail</h4></div>
                  <div className="flex-1 overflow-auto p-4 space-y-4">
                    {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      auditLogs.map((log: any, i: number) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const userStat = stats.find((s: any) => s.id === log.uniqueUserId);
                        const userColor = userStat ? userStat.text : "text-slate-600";
                        const userName = userStat ? userStat.name : `Archived (${log.uniqueUserId.slice(-4)})`;
                        return (
                          <div key={i} className="flex gap-3 relative">
                            {i !== auditLogs.length - 1 && <div className="absolute top-5 left-1.5 w-px h-full bg-slate-200" />}
                            <div className={`relative z-10 size-3 rounded-full mt-1 shrink-0 bg-white border-2 ${userStat ? userStat.border : "border-slate-300"}`} />
                            <div className="flex-1 pb-4">
                              <div className="flex justify-between items-start mb-0.5"><span className={`text-xs font-bold ${userColor}`}>{userName}</span><span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1 rounded">clk:{log.clock}</span></div>
                              <p className="text-[11px] text-slate-500">Executed <span className="font-semibold text-slate-700">{log.operations}</span> consecutive operations.</p>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>

                {/* 4. RAW JSON DUMP */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-[250px]">
                  <div className="bg-slate-950 p-3 border-b border-slate-800"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><SearchCode className="size-3 text-emerald-500" /> Raw CRDT Nodes (JSON)</h4></div>
                  <div className="flex-1 overflow-auto p-4">
                    <pre className="text-[10px] font-mono text-emerald-400 leading-relaxed">
                      {JSON.stringify(rawNodes, null, 2)}
                    </pre>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};