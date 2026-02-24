import { MessageSquare, Users, Video } from "lucide-react";

export default function ChatLandingPage() {
  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)] items-center justify-center p-8">
      <div className="max-w-3xl space-y-8">
        <div className="rounded-3xl border border-border/70 bg-card/80 p-8 shadow-softLg">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Start a conversation</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Select someone from the directory or create a group to begin chatting.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Users,
              title: "Create a group",
              description: "Bring multiple teammates into a shared space.",
            },
            {
              icon: Video,
              title: "Start a call",
              description: "Launch audio or video from any conversation.",
            },
            {
              icon: MessageSquare,
              title: "Share updates",
              description: "Keep everyone aligned with crisp, fast messages.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border/80 bg-card/70 p-6 shadow-soft"
            >
              <item.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
