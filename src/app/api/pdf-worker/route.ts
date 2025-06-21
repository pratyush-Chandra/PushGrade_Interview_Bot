import { NextRequest, NextResponse } from "next/server";

// Using eval('require') to bypass Next.js build-time static analysis
// This is a workaround for a stubborn build error with this library.
const pdfParse = eval('require')('pdf-parse');

export async function POST(req: NextRequest) {
  try {
    const file = await req.blob();

    if (!file) {
      return NextResponse.json({ error: "No file data" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const data = await pdfParse(buffer);
    return NextResponse.json({ text: data.text });
  } catch (err) {
    console.error("[PDF Worker Error]", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "PDF worker failed", details: errorMessage },
      { status: 500 }
    );
  }
} 