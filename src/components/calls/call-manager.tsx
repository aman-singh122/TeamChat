"use client";

import * as React from "react";
import { PhoneIncoming, PhoneOff, PhoneOutgoing, Video } from "lucide-react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import { useMutation, useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";

import { api } from "@/convex/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function CallManager() {
  const { isLoaded, isSignedIn } = useAuth();
  const shouldRun = isLoaded && isSignedIn;
  const currentUser = useQuery(api.users.getCurrent, shouldRun ? {} : "skip");
  const active = useQuery(api.calls.getActiveForUser, shouldRun ? {} : "skip");
  const acceptCall = useMutation(api.calls.acceptCall);
  const declineCall = useMutation(api.calls.declineCall);
  const endCall = useMutation(api.calls.endCall);
  const [token, setToken] = React.useState<string | null>(null);
  const [connecting, setConnecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  const call = active?.call ?? null;
  const caller = active?.caller ?? null;
  const conversation = active?.conversation ?? null;
  const currentUserId = currentUser?._id;
  const isCaller = !!call && !!currentUserId && call.callerId === currentUserId;
  const isCallee =
    !!call && !!currentUserId && call.calleeIds.includes(currentUserId);
  const isRinging = call?.status === "ringing";
  const isAccepted = call?.status === "accepted";

  React.useEffect(() => {
    if (!isAccepted || !call) {
      setToken(null);
      setOpen(false);
      return;
    }

    const fetchToken = async () => {
      setConnecting(true);
      setError(null);
      try {
        if (!livekitUrl) {
          throw new Error("Missing LiveKit URL");
        }
        const response = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomName: call.roomName }),
        });
        if (!response.ok) {
          throw new Error("Failed to fetch token");
        }
        const data = (await response.json()) as { token: string };
        setToken(data.token);
        setOpen(true);
      } catch (err) {
        setError("Call connection failed. Please try again.");
      } finally {
        setConnecting(false);
      }
    };

    void fetchToken();
  }, [call, isAccepted, livekitUrl]);

  const handleAccept = async () => {
    if (!call || !currentUserId) return;
    await acceptCall({ callId: call._id });
  };

  const handleDecline = async () => {
    if (!call || !currentUserId) return;
    await declineCall({ callId: call._id });
  };

  const handleEnd = async () => {
    if (!call || !currentUserId) return;
    await endCall({ callId: call._id });
    setOpen(false);
  };

  if (!currentUser || !call || !conversation) {
    return null;
  }

  return (
    <>
      {isRinging && isCallee && !isCaller ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <Card className="w-full max-w-md space-y-5 p-6 shadow-softLg">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <PhoneIncoming className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base font-semibold">Incoming call</p>
                <p className="text-sm text-muted-foreground">
                  {caller?.name ?? "Someone"} · {call.type}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button className="flex-1" onClick={handleAccept}>
                Answer
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleDecline}>
                Decline
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      {isRinging && isCaller ? (
        <div className="fixed left-1/2 top-6 z-40 w-[360px] -translate-x-1/2">
          <Card className="space-y-3 p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <PhoneOutgoing className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Calling...</p>
                <p className="text-xs text-muted-foreground">
                  Waiting for {caller ? "someone" : "a teammate"} to answer
                </p>
              </div>
            </div>
            <Button variant="destructive" className="w-full" onClick={handleEnd}>
              Cancel
            </Button>
          </Card>
        </div>
      ) : null}

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next && call) {
            void handleEnd();
          }
          setOpen(next);
        }}
      >
        <DialogContent className="max-w-5xl">
          {connecting ? (
            <div className="rounded-2xl border border-border/80 bg-muted/40 p-6 text-center text-sm text-muted-foreground">
              Connecting to LiveKit...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-border/80 bg-destructive/10 p-6 text-center text-sm text-destructive">
              {error}
            </div>
          ) : token ? (
            <div className="overflow-hidden rounded-2xl border border-border/70">
              <LiveKitRoom
                token={token}
                serverUrl={livekitUrl}
                data-lk-theme="default"
                video={call.type === "video"}
                audio
                connect
                onDisconnected={handleEnd}
              >
                <VideoConference />
              </LiveKitRoom>
              <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
                <div className="flex items-center gap-2 text-sm">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  {call.type === "video" ? "Video call" : "Audio call"}
                </div>
                <Button variant="destructive" onClick={handleEnd}>
                  <PhoneOff className="h-4 w-4" />
                  Leave call
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
