import { NextResponse } from "next/server";

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

export async function POST(req: Request) {
  try {
    const { text, action, context } = await req.json();

    // fallback if context not provided
    const docContext = context || "";

    let prompt = "";

    // 🔹 COMMON SYSTEM RULE (VERY IMPORTANT)
    const systemInstruction = `
You are an AI assistant inside a professional document editor.

STRICT RULES (DO NOT BREAK):

1. ALWAYS return clean HTML
2. NEVER use markdown (no **, no ##, no -)
3. NEVER return plain text
4. NEVER include \`\`\`
5. DO NOT include <html>, <body>

FORMATTING RULES:
- Paragraph → <p>
- Headings → <h2> or <h3>
- Lists → <ul><li>
- Bold → <strong>

STYLE:
- Keep professional formatting
- Match document tone
- Keep spacing clean

EXAMPLE OUTPUT:
<h3>History of New Delhi</h3>
<p>New Delhi has a rich history...</p>

<ul>
  <li>India Gate...</li>
  <li>Red Fort...</li>
</ul>
`;

    // 🔹 ACTION BASED PROMPTS

    if (action === "summarize") {
      prompt = `
${systemInstruction}

Task:
Summarize the following content.

Document Style Reference:
${docContext}

Content:
${text}
`;
    }

    if (action === "rewrite") {
      prompt = `
${systemInstruction}

Task:
Rewrite the following content in clearer and better English.

Document Style Reference:
${docContext}

Content:
${text}
`;
    }

    if (action === "qa") {
      prompt = `
${systemInstruction}

Task:
Answer the user's question using:
1. The document (if relevant)
2. Your general knowledge (if needed)

Document:
${docContext}

User Question:
${text}
`;
    }

    if (action === "generate") {
      prompt = `
${systemInstruction}

Task:
Generate content based on the user's request.

Document Style Reference:
${docContext}

User Prompt:
${text}
`;
    }

    // 🔹 API CALL
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // faster + good for editor
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    const data = await response.json();

    console.log("Groq response:", data);

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || "Groq request failed" },
        { status: 500 }
      );
    }

    let result = data.choices?.[0]?.message?.content ?? "";

    // 🔹 SAFETY: Ensure valid HTML fallback
    if (!result.trim().startsWith("<")) {
      result = result
        .split("\n")
        .map((p: string) => `<p>${p}</p>`)
        .join("");
    }

    return NextResponse.json({
      result,
    });

  } catch (error) {
    console.error("AI API error:", error);

    return NextResponse.json(
      { error: "Server AI error" },
      { status: 500 }
    );
  }
}