import { AccessToken } from "livekit-server-sdk";
import { getLiveKitServerEnv } from "@/lib/env";

type CreateTokenParams = {
  room: string;
  identity: string;
  name: string;
};

export function createLiveKitToken({
  room,
  identity,
  name,
}: CreateTokenParams) {
  const { livekitApiKey, livekitApiSecret } = getLiveKitServerEnv();

  if (!room) {
    throw new Error("Room is required");
  }

  if (!identity) {
    throw new Error("Identity is required");
  }

  // 🔥 Make identity unique per connection (VERY IMPORTANT)
  const uniqueIdentity = `${identity}-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)}`;

  const token = new AccessToken(livekitApiKey, livekitApiSecret, {
    identity: uniqueIdentity,
    name,
    ttl: "1h", // token valid for 1 hour
  });

  token.addGrant({
    room,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return token.toJwt();
}