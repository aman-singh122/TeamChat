export function getPublicEnv() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_URL");
  }

  return { convexUrl };
}

export function getLiveKitPublicEnv() {
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
  if (!livekitUrl) {
    throw new Error("Missing NEXT_PUBLIC_LIVEKIT_URL");
  }
  return { livekitUrl };
}

export function getOpenAIEnv() {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }
  return { openaiApiKey };
}

export function getLiveKitServerEnv() {
  const livekitApiKey = process.env.LIVEKIT_API_KEY;
  const livekitApiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitUrl = process.env.LIVEKIT_URL;

  if (!livekitApiKey || !livekitApiSecret || !livekitUrl) {
    throw new Error("Missing LiveKit server configuration");
  }

  return { livekitApiKey, livekitApiSecret, livekitUrl };
}
