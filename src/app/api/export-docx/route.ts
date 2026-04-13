import HTMLtoDOCX from "html-to-docx";

export async function POST(req: Request) {
  try {
    const { html } = await req.json();

    if (!html) {
      return new Response("Invalid HTML", { status: 400 });
    }

    const buffer = await HTMLtoDOCX(html, null, {
      table: { row: { cantSplit: true } },
    });

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": "attachment; filename=DoczFlow.docx",
      },
    });
  } catch (err) {
    console.error(err);
    return new Response("Export failed", { status: 500 });
  }
}