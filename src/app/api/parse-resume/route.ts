import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    const workerUrl = new URL("/api/pdf-worker", req.url);

    // Forward the file blob to the worker
    const response = await fetch(workerUrl, {
      method: "POST",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "PDF worker failed");
    }

    const data = await response.json();
    return NextResponse.json({ text: data.text });
  } catch (err) {
    console.error("PDF Proxy Error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to process PDF via worker", details: errorMessage },
      { status: 500 }
    );
  }
} 