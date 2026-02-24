import { NextResponse } from "next/server";

import { getGeminiEnv } from "@/lib/env";
import { buildSummaryPrompt } from "@/lib/ai/summary";

export const runtime = "nodejs";

type SummaryRequest = {
  messages: Array<{
    text: string;
    sender: string;
    createdAt: number;
  }>;
};

function fallbackSummaryFromMessages(messages: SummaryRequest["messages"]) {
  const recent = messages
    .slice(-5)
    .map((message) => `- ${message.sender}: ${message.text}`);

  return recent.join("\n");
}

function sanitizeSummary(raw: string) {
  const cleaned = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^here'?s\s+a\s+summary/i.test(line))
    .filter((line) => !/^summary\s*:/i.test(line))
    .map((line) => (line.startsWith("- ") ? line : `- ${line.replace(/^[•*-]\s*/, "")}`));

  return cleaned.join("\n");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SummaryRequest;
    if (!body.messages || body.messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided." },
        { status: 400 }
      );
    }

    const { geminiApiKey, geminiModel } = getGeminiEnv();

    const formatted = body.messages
      .slice(0, 200)
      .map(
        (message) =>
          `- ${new Date(message.createdAt).toISOString()} | ${message.sender}: ${message.text}`
      )
      .join("\n");

    const candidateModels = Array.from(
      new Set([geminiModel, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"])
    );

    let summary = "";
    let lastError = "Gemini request failed";
    for (const model of candidateModels) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: buildSummaryPrompt(formatted) }],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 300,
            },
          }),
        }
      );

      const payload = (await response.json()) as {
        candidates?: Array<{
          content?: {
            parts?: Array<{ text?: string }>;
          };
        }>;
        error?: { message?: string };
      };

      if (!response.ok) {
        lastError = payload.error?.message ?? "Gemini request failed";
        continue;
      }

      summary =
        payload.candidates?.[0]?.content?.parts
          ?.map((part) => part.text ?? "")
          .join("\n")
          .trim() ?? "";

      if (summary) {
        break;
      }
      lastError = "Gemini returned an empty summary";
    }

    if (!summary) {
      throw new Error(lastError);
    }

    const normalized = sanitizeSummary(summary);
    const finalSummary =
      normalized && normalized.length > 10
        ? normalized
        : fallbackSummaryFromMessages(body.messages);

    return NextResponse.json({ summary: finalSummary });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate summary.";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
