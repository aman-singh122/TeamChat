import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createLiveKitToken } from "@/lib/livekit/token";

export const runtime = "nodejs";

type TokenRequest = {
  roomName: string;
};

export async function POST(request: Request) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as TokenRequest;

  if (!body.roomName) {
    return NextResponse.json(
      { error: "Room name is required" },
      { status: 400 }
    );
  }

  const name =
    typeof sessionClaims?.name === "string"
      ? sessionClaims.name
      : typeof sessionClaims?.email === "string"
      ? sessionClaims.email
      : "Guest";

  // 🔥 IMPORTANT: await here
  const token = await createLiveKitToken({
    room: body.roomName,
    identity: userId,
    name,
  });

  console.log("Generated JWT:", token); // optional debug

  return NextResponse.json({ token });
}