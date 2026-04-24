import { NextResponse } from "next/server";

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function POST(req: Request) {
  try {
    const { text, action, context, modifier, contextType, history } = await req.json();

    const docContext = context || "";
    let apiMessages: Message[] = [];
    let temperature = 0.3; // Default

    if (action === "qa") {
      // 🧠 BRAIN 1: CONVERSATIONAL CHAT ASSISTANT
      temperature = 0.6; 
      
      const chatInstruction = `
You are "DoczFlow AI", a highly intelligent, concise, and friendly assistant integrated into the DoczFlow document editor.

CRITICAL BEHAVIOR RULES:
1. IDENTITY: You are an AI assistant. Be conversational and natural. Do NOT use clunky phrases like "I exist in the digital realm" or "I am just a computer program". Talk like a helpful, normal colleague.
2. CONTEXT SEPARATION: Do NOT blindly summarize the document just because the user mentions keywords. If the user asks a casual question (e.g., "how are you", "hello"), reply casually and briefly. 
3. DOCUMENT USAGE: ONLY extract information from the "Document Context" if the user EXPLICITLY asks a question about the document's content, text, or data.

UI FORMATTING RULES:
1. You MUST format your responses using basic HTML tags (e.g., <p>, <strong>, <em>, <ul>, <li>).
2. NEVER use markdown (no **, no ##).
3. Do NOT wrap your response in \`\`\`html blocks.

CONTEXTUAL AWARENESS:
The user is currently looking at this content (Type: ${contextType || "Document"}):
"""
${docContext}
"""
`;
      apiMessages.push({ role: "system", content: chatInstruction });

      // Load previous conversation memory
      if (history && Array.isArray(history)) {
        history.forEach((msg) => {
           apiMessages.push({
             role: msg.role === "ai" ? "assistant" : "user",
             content: msg.text
           });
        });
      }

      // Add the current user message
      apiMessages.push({ role: "user", content: text });

    } else {
      // 🤖 BRAIN 2: STRICT EDITOR ROBOT (Bubble Menu)
      temperature = 0.2; // Highly deterministic
      
      const editorInstruction = `
You are a strict, automated text-processing engine integrated into a rich text editor.

CRITICAL ARCHITECTURAL RULE:
You MUST preserve the EXACT HTML tag structure provided. ONLY modify the text nodes INSIDE the tags.

STRICT OUTPUT RULES:
1. Output ONLY valid HTML.
2. NO markdown formatting whatsoever.
3. NO conversational filler (e.g., "Here is the corrected text:"). Speak ONLY in the requested output.
4. RETURN MINIFIED HTML. Do NOT include ANY newlines (\\n) or extra spaces between tags.`;

      let taskInstruction = "";
      if (action === "grammar") {
        taskInstruction = `Task: Fix the grammar and spelling. Do not change the original meaning.\nReturn ONLY the corrected HTML.\nInput HTML: ${text}`;
      } else if (action === "tone") {
        taskInstruction = `Task: Rewrite the text in a ${modifier} tone.\nReturn ONLY the rewritten HTML. Ensure bullet points remain bullet points.\nInput HTML: ${text}`;
      } else if (action === "translate") {
        taskInstruction = `Task: Translate the text into ${modifier}.\nReturn ONLY the translated HTML.\nInput HTML: ${text}`;
      }

      apiMessages = [
        { role: "system", content: editorInstruction },
        { role: "user", content: taskInstruction }
      ];
    }

    // 🔹 API CALL
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: apiMessages,
        temperature: temperature,
        max_tokens: 1500,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || "Groq request failed" },
        { status: 500 }
      );
    }

    let result = data.choices?.[0]?.message?.content ?? "";

    // CLEANUP: Always strip markdown code blocks if AI hallucinates them
    result = result.replace(/```html\n?/gi, "").replace(/```\n?/gi, "");

    // STRICT CLEANUP FOR EDITOR (Bubble Menu only - Do NOT minify chat)
    if (action !== "qa") {
      result = result.replace(/\n/g, "");
      result = result.replace(/>\s+</g, "><");
    }

    return NextResponse.json({ result: result.trim() });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json({ error: "Server AI error" }, { status: 500 });
  }
}