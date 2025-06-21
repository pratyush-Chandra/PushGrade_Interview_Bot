import { NextRequest, NextResponse } from "next/server";
import PDFParser from "pdf2json";

export async function POST(req: NextRequest) {
  try {
    const file = await req.blob();

    if (!file) {
      return NextResponse.json({ error: "No file data" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const pdfParser = new PDFParser();

    const text = await new Promise<string>((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (errData: { parserError: Error }) => {
        reject(errData.parserError);
      });
      pdfParser.on("pdfParser_dataReady", () => {
        resolve(pdfParser.getRawTextContent());
      });

      pdfParser.parseBuffer(buffer);
    });

    return NextResponse.json({ text });
  } catch (err) {
    console.error("[PDF Worker Error]", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "PDF worker failed", details: errorMessage },
      { status: 500 }
    );
  }
} 