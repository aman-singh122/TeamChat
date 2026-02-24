export function buildSummaryPrompt(formattedMessages: string) {
  return [
    {
      role: "system" as const,
      content:
        "You summarize missed chat messages into concise bullet points. Focus on decisions, action items, and key questions. Keep it under 8 bullets.",
    },
    {
      role: "user" as const,
      content: `Summarize the following missed messages:\n${formattedMessages}`,
    },
  ];
}
