"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/use-editor-store";

interface Props {
    onClose: () => void;
}

export default function AIChatPanel({ onClose }: Props) {
    const { editor } = useEditorStore();

    const [messages, setMessages] = useState<
        { role: "user" | "ai"; text: string }[]
    >([]);

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [lastAI, setLastAI] = useState("");

    const send = async () => {
        if (!input) return;

        const userMsg = input;

        setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
        setInput("");
        setLoading(true);

        // ✅ USE HTML CONTEXT (CRITICAL)
        const context = editor?.getHTML() || "";

        const res = await fetch("/api/ai", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text: userMsg,
                action: "qa",
                context,
            }),
        });

        const data = await res.json();

        const aiText = data.result;

        setMessages((prev) => [...prev, { role: "ai", text: aiText }]);
        setLastAI(aiText);
        setLoading(false);
    };

    const insert = () => {
        if (!editor || !lastAI) return;

        const cleanHTML = lastAI
            .replace(/\*\*/g, "") // remove markdown bold
            .replace(/```/g, "");

        editor.chain().focus().insertContent({
            type: "paragraph",
            content: [],
        }).insertContent(cleanHTML).run();
    };

    return (
        <div className="flex flex-col h-full">

            {/* HEADER */}
            <div className="p-3 border-b flex justify-between items-center">
                <h2 className="font-semibold">AI Assistant</h2>
                <button onClick={onClose}>✖</button>
            </div>

            {/* CHAT */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`text-sm p-2 rounded ${m.role === "user" ? "bg-blue-100" : "bg-gray-100"
                            }`}
                    >
                        {/* ✅ RENDER HTML SAFELY */}
                        <div dangerouslySetInnerHTML={{ __html: m.text }} />
                    </div>
                ))}
            </div>

            {/* INPUT */}
            <div className="p-3 border-t flex flex-col gap-2">
                <input
                    className="border p-2 rounded"
                    placeholder="Ask anything about document..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />

                <div className="flex gap-2">
                    <button
                        onClick={send}
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                        {loading ? "Thinking..." : "Send"}
                    </button>

                    <button
                        onClick={insert}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                        Insert
                    </button>
                </div>
            </div>
        </div>
    );
}