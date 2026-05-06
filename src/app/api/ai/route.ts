import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { pipeline } from "@xenova/transformers";

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

type Message = { role: "system" | "user" | "assistant"; content: string; };

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index("doczflow");

export async function POST(req: Request) {
  try {
    const { text, action, context, documentId, modifier, contextType, history } = await req.json();

    let docContext = "";
    let apiMessages: Message[] = [];
    let temperature = 0.3;

    if (action === "qa") {
      temperature = 0.6; 

      // 🔥 RAG IMPLEMENTATION: Find relevant chunks
      if (contextType === "Document" && documentId) {
          try {
              const generateEmbedding = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
              const queryVector = await generateEmbedding(text, { pooling: "mean", normalize: true });
              const embeddingArray = Array.from(queryVector.data) as number[];

              const queryResponse = await index.query({
                  vector: embeddingArray,
                  topK: 3,
                  filter: { documentId: { "$eq": documentId } },
                  includeMetadata: true
              });

              docContext = queryResponse.matches.map(m => m.metadata?.text).join("\n\n---\n\n");
          } catch (e) {
              console.error("Vector search failed, falling back to empty context", e);
              docContext = ""; 
          }
      } else {
          docContext = context || "";
      }

      // 🔥 THE FIX: Tri-Mode Prompting for Selection vs RAG vs Empty
      let chatInstruction = "";
      
      if (contextType === "Selection" && docContext.trim().length > 0) {
          // MODE A: User highlighted specific text
          chatInstruction = `
You are "DoczFlow AI", a strict and precise assistant integrated into the DoczFlow editor.
The user has highlighted this specific section of their document:
"""
${docContext}
"""
You MUST analyze and address the ENTIRE highlighted text comprehensively. 
Do NOT reference previous actions, do NOT make up narratives about what the user selected previously, and do NOT ignore any part of the text. Stick strictly to explaining, summarizing, or modifying the provided text as requested.
Format all responses strictly in basic HTML (e.g., <p>, <strong>, <ul>, <li>). NO Markdown.
`;
      } else if (docContext && docContext !== "No relevant context found in database." && docContext.trim().length > 0) {
          // MODE B: Document has content -> Full Document RAG
          chatInstruction = `
You are "DoczFlow AI", an assistant integrated into the DoczFlow editor.
Here is the MOST RELEVANT text retrieved from the user's document to answer their question:
"""
${docContext}
"""
You MUST answer the user's question based ONLY on the context provided above. 
If the context doesn't contain the answer, politely state that you cannot find it in the current document context, BUT then try to provide a general helpful answer anyway based on your knowledge.
Format all your responses strictly in basic HTML (e.g., <p>, <strong>, <ul>, <li>, <br>). NO Markdown formatting like ** or ##.
`;
      } else {
          // MODE C: Document is empty or no context matched -> Creative writer
          chatInstruction = `
You are "DoczFlow AI", a helpful and creative writing assistant integrated into a document editor. 
The user's document is currently empty or they are asking for general content generation.
Fulfill the user's request comprehensively (e.g., writing essays, emails, drafting code, or brainstorming).
Format all your responses strictly in basic HTML (e.g., <p>, <strong>, <ul>, <li>, <br>). Do NOT use Markdown formatting like ** or ##.
`;
      }

      apiMessages.push({ role: "system", content: chatInstruction });

      if (history && Array.isArray(history)) {
        history.slice(-4).forEach((msg) => {
           apiMessages.push({ role: msg.role === "ai" ? "assistant" : "user", content: msg.text });
        });
      }
      apiMessages.push({ role: "user", content: text });

    } else {
      // BUBBLE MENU ACTIONS (Grammar, Translate, Tone) - Uses direct text
      temperature = 0.2; 
      const editorInstruction = `You are a strict text-processing engine. Preserve EXACT HTML structure. Return ONLY minified HTML. No newlines. No markdown.`;
      
      let taskInstruction = `Task: Process this HTML.\nInput HTML: ${text}`;
      if (action === "grammar") taskInstruction = `Task: Fix grammar and spelling. Return ONLY corrected HTML.\nInput HTML: ${text}`;
      else if (action === "tone") taskInstruction = `Task: Rewrite in a ${modifier} tone. Return ONLY rewritten HTML.\nInput HTML: ${text}`;
      else if (action === "translate") taskInstruction = `Task: Translate to ${modifier}. Return ONLY translated HTML.\nInput HTML: ${text}`;

      apiMessages = [
        { role: "system", content: editorInstruction },
        { role: "user", content: taskInstruction }
      ];
    }

    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({ model: "llama-3.1-8b-instant", messages: apiMessages, temperature, max_tokens: 1500 }), 
    });

    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data.error?.message || "Groq failed" }, { status: 500 });

    let result = data.choices?.[0]?.message?.content ?? "";
    result = result.replace(/```html\n?/gi, "").replace(/```\n?/gi, "");

    if (action !== "qa") {
      result = result.replace(/\n/g, "").replace(/>\s+</g, "><");
    }

    return NextResponse.json({ result: result.trim() });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json({ error: "Server AI error" }, { status: 500 });
  }
}