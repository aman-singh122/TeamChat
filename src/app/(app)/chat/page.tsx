import { ArrowRight, MessageSquare, Sparkles, Users, Video } from "lucide-react";

import { Button } from "@/components/ui/button";

const quickActions = [
  {
    icon: Users,
    title: "Create a group",
    description: "Bring teammates together with one shared timeline.",
  },
  {
    icon: Video,
    title: "Start a call",
    description: "Jump into audio or video directly from conversation context.",
  },
  {
    icon: MessageSquare,
    title: "Share updates",
    description: "Keep everyone aligned with fast, focused status messages.",
  },
];

export default function ChatLandingPage() {
  return (
    <div className="relative flex h-full min-h-0 flex-1 overflow-auto bg-background px-6 py-8 md:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-160px] h-[360px] w-[360px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-180px] right-[-120px] h-[360px] w-[360px] rounded-full bg-success/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl space-y-6">
        <section className="rounded-3xl border border-border/80 bg-card/85 p-6 shadow-softLg md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Collaboration Hub
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  Start your next conversation
                </h2>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
                  Select someone from your sidebar, create a group, or begin a call to continue work without context switching.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Button className="rounded-xl px-4">
                Open conversation
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {quickActions.map((item) => (
            <article
              key={item.title}
              className="group rounded-2xl border border-border/80 bg-card/70 p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-softLg"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
