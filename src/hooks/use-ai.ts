export async function callAI(text: string, action: string) {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, action }),
  });

  const data = await res.json();
  return data.result;
}