import { NextResponse } from "next/server";
import HTMLtoDOCX from "html-to-docx";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
  try {
    const { html } = await req.json();

    if (!html) {
      return new NextResponse("Invalid HTML", { status: 400 });
    }

    const $ = cheerio.load(html, null, false);

    // 1. SAFELY UNWRAP TABLES & FIX INNER CELL BORDERS
    $('div.tableWrapper').each(function () {
      $(this).replaceWith($(this).html() || '');
    });

    $('table').each(function () {
      $(this).attr('border', '1');
      $(this).attr('cellspacing', '0');
      $(this).attr('cellpadding', '5');
      $(this).css('border-collapse', 'collapse');
      $(this).css('width', '100%');
    });

    // Word demands explicit styling on the cells, not just the parent table
    $('td, th').each(function () {
      $(this).css('border', '1px solid black');
    });

    // 2. FETCH IMAGES & EMBED AS BASE64
    // Word will not fetch Convex URLs. We must embed the raw data.
    const images = $('img').toArray();
    for (const imgElement of images) {
      const $img = $(imgElement);
      const src = $img.attr('src');

      // Purge local blob URLs
      if (src && src.startsWith('blob:')) {
        $img.remove();
        continue;
      }

      if (src && src.startsWith('http')) {
        try {
          const response = await fetch(src);
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64 = buffer.toString('base64');
            const contentType = response.headers.get('content-type') || 'image/png';

            // Inject the Base64 data
            $img.attr('src', `data:${contentType};base64,${base64}`);
            
            // Constrain width to prevent margin overflow in Word
            $img.attr('width', '600');
            $img.removeAttr('style');
            $img.removeAttr('height');
          } else {
            // If fetch fails, remove the broken image tag entirely
            $img.remove();
          }
        } catch (error) {
          console.error(`Failed to fetch image: ${src}`, error);
          $img.remove();
        }
      }
    }

    const cleanHtml = $.html();

    // 3. GENERATE THE DOCX (PURE CALL, NO OPTIONS OBJECT)
    const buffer = await HTMLtoDOCX(cleanHtml);

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="DoczFlow.docx"`,
      },
    });
  } catch (err) {
    console.error("DOCX Export Error:", err);
    return new NextResponse("Export failed", { status: 500 });
  }
}