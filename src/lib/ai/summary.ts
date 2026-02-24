export function buildSummaryPrompt(formattedMessages: string) {
  return [
    "You summarize chat messages into concise, concrete bullet points.",
    "Strict output format: bullet points only, each starting with '- '.",
    "Do not add an intro line like 'Here's a summary'.",
    "Mention concrete details from the messages (people, plans, questions, decisions).",
    "If there are very few messages, still summarize them clearly in 1-3 bullets.",
    "Maximum 8 bullets.",
    "",
    "Messages:",
    formattedMessages,
  ].join("\n");
}
