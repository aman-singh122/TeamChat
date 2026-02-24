import { NextResponse } from "next/server";
import OpenAI from "openai";

import { getOpenAIEnv } from "@/lib/env";
import { buildSummaryPrompt } from "@/lib/ai/summary";

export const runtime = "nodejs";

type SummaryRequest = {
  messages: Array<{
    text: string;
    sender: string;
    createdAt: number;
  }>;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SummaryRequest;
    if (!body.messages || body.messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided." },
        { status: 400 }
      );
    }

    const { openaiApiKey } = getOpenAIEnv();
    const client = new OpenAI({ apiKey: openaiApiKey });

    const formatted = body.messages
      .slice(0, 200)
      .map(
        (message) =>
          `- ${new Date(message.createdAt).toISOString()} | ${message.sender}: ${message.text}`
      )
      .join("\n");

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 300,
      messages: buildSummaryPrompt(formatted),
    });

    const summary = completion.choices[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ summary });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate summary." },
      { status: 500 }
    );
  }
}
