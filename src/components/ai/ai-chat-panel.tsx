"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation"; // 🔥 ADD THIS IMPORT
import { useEditorStore } from "@/store/use-editor-store";
import { Loader2, SendIcon, CheckIcon, XIcon, CopyIcon, Trash2Icon, TargetIcon } from "lucide-react";
import { toast } from "sonner";

interface Props {
    onClose: () => void;
}

export default function AIChatPanel({ onClose }: Props) {
    const { editor } = useEditorStore();
    const params = useParams(); // 🔥 GET URL PARAMS
    const documentId = params.documentId as string; // 🔥 EXTRACT DOC ID
    
    // 🔥 FIX: Ref targets the scrollable container, not just the end div
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [lastAI, setLastAI] = useState("");
    const [inserted, setInserted] = useState(false);
    
    const [selectedContext, setSelectedContext] = useState("");

    // 🔥 FIX: Precise container-bound scrolling. No global scroll leaps.
    useEffect(() => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            container.scrollTo({
                top: container.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [messages, loading]);

    useEffect(() => {
        if (!editor) return;
        
        const handleSelection = () => {
            const { from, to } = editor.state.selection;
            const text = editor.state.doc.textBetween(from, to, " ");
            
            if (text.trim().length > 0) {
                setSelectedContext(text); 
            } else if (editor.isFocused) {
                setSelectedContext(""); 
            }
        };

        editor.on("selectionUpdate", handleSelection);
        return () => { editor.off("selectionUpdate", handleSelection); }
    }, [editor]);

    const clearChat = () => {
        setMessages([]);
        setLastAI("");
        toast.success("Chat cleared");
    };

    const copyToClipboard = (text: string) => {
        const plainText = text.replace(/<[^>]*>?/gm, '');
        navigator.clipboard.writeText(plainText);
        toast.success("Copied to clipboard");
    };

    const send = async () => {
        if (!input.trim() || loading || !editor) return;

        const userMsg = input.trim();
        setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
        setInput("");
        setLoading(true);
        setInserted(false);

        const contextType = selectedContext ? "Selection" : "Document";
        
        // 🔥 CRITICAL FIX: If it's a "Document" query, DON'T send the 95k chars to the API. 
        // Let the backend fetch the 3 relevant chunks from Pinecone.
        const contextData = selectedContext ? selectedContext : "";

        try {
            const res = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: userMsg,
                    action: "qa",
                    context: contextData, 
                    documentId: documentId, // 🔥 FIX: Now this sends the actual valid Convex ID!
                    contextType: contextType, 
                    history: messages
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setMessages((prev) => [...prev, { role: "ai", text: data.result }]);
            setLastAI(data.result);
        } catch (error) {
            console.error(error);
            setMessages((prev) => [...prev, { role: "ai", text: "<p>⚠️ Sorry, I encountered an error connecting to the AI.</p>" }]);
        } finally {
            setLoading(false);
        }
    };

    const insert = () => {
        if (!editor || !lastAI) return;
        
        // Sanitize the HTML: Replace newlines with space, and remove spaces between tags
        // This prevents Tiptap from rendering structural whitespace as empty bullet points or paragraphs.
        const cleanHTML = lastAI.replace(/\n/g, " ").replace(/>\s+</g, "><").trim();
        
        editor.chain().focus().insertContent(cleanHTML).run();
        setInserted(true);
        setTimeout(() => setInserted(false), 2000);
    };

    return (
        <div className="flex flex-col h-full bg-white shadow-xl border-l border-gray-200">
            {/* HEADER */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50/80 backdrop-blur-sm shrink-0">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <span className="text-purple-600">✨</span> DoczFlow AI 
                </h2>
                <div className="flex items-center gap-1">
                    {messages.length > 0 && (
                        <button onClick={clearChat} title="Clear Chat" className="p-1.5 hover:bg-red-100 hover:text-red-600 text-gray-500 rounded-md transition">
                            <Trash2Icon className="size-4" />
                        </button>
                    )}
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-200 text-gray-500 rounded-md transition">
                        <XIcon className="size-4" />
                    </button>
                </div>
            </div>

            {/* CHAT AREA */}
            <div 
                ref={scrollContainerRef} 
                className="flex-1 overflow-y-auto p-4 space-y-5 bg-white scroll-smooth"
            >
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-4">
                        <div className="size-12 bg-purple-50 rounded-full flex items-center justify-center">
                            <span className="text-2xl">👋</span>
                        </div>
                        <p className="text-sm px-4">
                            Ask me to summarize, find info, or draft new content. <br/><br/>
                            <strong className="font-medium text-gray-500">Tip:</strong> 
                            <ul>
                                <li>Highlight text in the document to lock it as the target!</li>
                                <li>Save Vesion of Document to make DoczFlow AI Up to Date... </li>
                            </ul>
                        </p>
                    </div>
                )}
                
                {messages.map((m, i) => (
                    <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                        <div className={`text-sm p-3 rounded-2xl max-w-[85%] relative group ${
                            m.role === "user" 
                            ? "bg-blue-600 text-white rounded-br-none shadow-sm" 
                            : "bg-gray-50 text-gray-800 rounded-bl-none border border-gray-200 shadow-sm"
                        }`}>
                            <div 
                                dangerouslySetInnerHTML={{ __html: m.text }} 
                                className="max-w-none break-words space-y-2 [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:ml-4 [&_ol]:my-1 [&_strong]:font-bold [&_h3]:font-bold [&_h3]:text-base [&_h2]:font-bold [&_h2]:text-lg [&_p]:m-0" 
                            />
                            
                            {m.role === "ai" && (
                                <button 
                                    onClick={() => copyToClipboard(m.text)}
                                    className="absolute -right-8 top-2 p-1.5 bg-white border border-gray-200 rounded-md opacity-0 group-hover:opacity-100 transition shadow-sm hover:bg-gray-50"
                                    title="Copy response"
                                >
                                    <CopyIcon className="size-3 text-gray-500" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-50 p-4 rounded-2xl rounded-bl-none border border-gray-200 flex items-center gap-2">
                            <Loader2 className="size-4 animate-spin text-purple-600" />
                            <span className="text-xs text-gray-500 font-medium">AI is thinking...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* ACTION & INPUT AREA */}
            <div className="p-4 border-t bg-white flex flex-col gap-3 shrink-0">
                {lastAI && !loading && (
                    <button 
                        onClick={insert}
                        disabled={inserted}
                        className={`w-full py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition duration-200 ${
                            inserted ? "bg-green-50 border-green-200 text-green-700" : "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 shadow-sm"
                        }`}
                    >
                        {inserted ? <><CheckIcon className="size-4"/> Inserted at cursor!</> : "Insert Response at Cursor"}
                    </button>
                )}
                
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1 mb-1">
                        <span className="text-[10px] font-bold tracking-wider text-gray-500 flex items-center gap-1.5">
                            <TargetIcon className="size-3 text-gray-400" />
                            TARGET: 
                            {selectedContext ? (
                                <span className="text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded max-w-[140px] truncate border border-purple-200 inline-block">
                                    &ldquo;{selectedContext}&rdquo;
                                </span>
                            ) : (
                                <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 inline-block">
                                    Entire Document
                                </span>
                            )}
                        </span>
                        {selectedContext && (
                            <button 
                                onClick={() => { setSelectedContext(""); editor?.commands.focus(); }} 
                                className="text-[10px] text-gray-400 hover:text-red-500 hover:underline transition"
                            >
                                Clear Target
                            </button>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <input
                            className="flex-1 border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-sm transition"
                            placeholder={selectedContext ? "Ask about targeted text..." : "Ask about document..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && send()}
                            disabled={loading}
                        />
                        <button
                            onClick={send}
                            disabled={loading || !input.trim()}
                            className="bg-purple-600 text-white px-3.5 py-2.5 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition shadow-sm flex items-center justify-center"
                        >
                            <SendIcon className="size-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}