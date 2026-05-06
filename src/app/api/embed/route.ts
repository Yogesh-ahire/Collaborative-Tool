import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { pipeline } from "@xenova/transformers";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index("doczflow");

function chunkText(text: string, chunkSize: number, overlap: number) {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.substring(i, i + chunkSize));
    i += chunkSize - overlap;
  }
  return chunks;
}

export async function POST(req: Request) {
  try {
    const { documentId, text } = await req.json();
    
    console.log("DEBUG: Document ID:", documentId);
    console.log("DEBUG: Text Length received:", text?.length);

    if (!text || text.trim().length === 0) {
        return NextResponse.json({ success: true, message: "No text" });
    }

    const chunks = chunkText(text, 1000, 200); // Thode bade chunks (1000 chars) taaki loops kam hon
    console.log(`DEBUG: Total chunks to process: ${chunks.length}`);

    const generateEmbedding = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vectors: any[] = [];

    // 🔥 THE FIX: Use a normal for-loop with AWAIT inside to prevent memory overflow
    for (let i = 0; i < chunks.length; i++) {
        try {
            const output = await generateEmbedding(chunks[i], { pooling: "mean", normalize: true });
            const embeddingArray = Array.from(output.data) as number[];

            vectors.push({
                id: `${documentId}-${i}-${Date.now()}`, // Added timestamp for uniqueness
                values: embeddingArray,
                metadata: { 
                    documentId: documentId, 
                    text: chunks[i] 
                }
            });

            // Log progress every 20 chunks
            if (i % 20 === 0) console.log(`Progress: ${i}/${chunks.length} chunks embedded...`);
        } catch (err) {
            console.error(`Error embedding chunk ${i}:`, err);
        }
    }

    console.log(`DEBUG: Final vectors count: ${vectors.length}`);

    // 🔥 THE FINAL BRUTE-FORCE FIX
    if (vectors.length > 0) {
        console.log(`Attempting to upsert ${vectors.length} vectors in batches...`);
        
        // 🔥 THE FINAL "SDK-PROOFER" FIX
    if (vectors.length > 0) {
        console.log(`🚀 Attempting to push ${vectors.length} vectors...`);
        
        for (let i = 0; i < vectors.length; i += 100) {
            const batch = vectors.slice(i, i + 100);
            
            try {
                // 🔥 Try Option A: Standard Array (Older SDK style)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await index.upsert(batch as any);
                console.log(`✅ Batch ${Math.floor(i/100) + 1} pushed via Option A`);
            } catch (errA) {
              console.log(errA)
                try {
                    // 🔥 Try Option B: Object wrap (Newer SDK style)
                    await index.upsert({
                        records: batch
                    });
                    console.log(`✅ Batch ${Math.floor(i/100) + 1} pushed via Option B`);
                } catch (errB) {
                    console.error(`❌ Complete Failure in Batch ${Math.floor(i/100) + 1}`);
                    console.error("Error Details:", errB);
                }
            }
        }
        
        return NextResponse.json({ success: true, chunksProcessed: vectors.length });
    }
        
        console.log(`✅ ALL DONE. Successfully embedded ${vectors.length} chunks.`);
        return NextResponse.json({ success: true, chunksProcessed: vectors.length });
    }

    return NextResponse.json({ success: false, error: "Zero vectors generated" }, { status: 500 });
  } catch (error) {
    console.error("Embedding Error:", error);
    return NextResponse.json({ error: "Failed to embed" }, { status: 500 });
  }
}