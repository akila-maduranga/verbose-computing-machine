import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const elevenLabsFormData = new FormData();
    elevenLabsFormData.append("file", file);
    elevenLabsFormData.append("model_id", "scribe_v2");

    const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
      },
      body: elevenLabsFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.detail || "Transcription failed" }, { status: response.status });
    }

    const data = await response.json();
    
    // Generate VTT content from segments
    const vttContent = generateVTT(data.words || data.segments || []);

    return NextResponse.json({ vtt: vttContent, text: data.text });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function generateVTT(segments) {
  let vtt = "WEBVTT\n\n";

  segments.forEach((segment, index) => {
    const start = formatTime(segment.start);
    const end = formatTime(segment.end);
    const text = segment.text || segment.word;

    vtt += `${index + 1}\n${start} --> ${end}\n${text}\n\n`;
  });

  return vtt;
}

function formatTime(seconds) {
  const date = new Date(null);
  date.setSeconds(seconds);
  const ms = Math.floor((seconds % 1) * 1000);
  return date.toISOString().substr(11, 8) + "." + ms.toString().padStart(3, "0");
}
