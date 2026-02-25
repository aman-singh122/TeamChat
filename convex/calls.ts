import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

type ConvexCtx = MutationCtx | QueryCtx;

async function getCurrentUser(ctx: ConvexCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export const createCall = mutation({
  args: {
    conversationId: v.id("conversations"),
    type: v.union(v.literal("audio"), v.literal("video")),
  },
  handler: async (ctx, args) => {
    const current = await getCurrentUser(ctx);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.members.includes(current._id)) {
      throw new Error("Conversation not found");
    }

    const active = await ctx.db
      .query("calls")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const hasActive = active.some(
      (call) => call.status === "ringing" || call.status === "accepted"
    );
    if (hasActive) {
      throw new Error("Call already active");
    }

    const calleeIds = conversation.members.filter(
      (memberId) => memberId !== current._id
    );

    if (calleeIds.length === 0) {
      throw new Error("No participants available");
    }

    return ctx.db.insert("calls", {
      conversationId: args.conversationId,
      callerId: current._id,
      calleeIds,
      roomName: `${args.conversationId}-${Date.now()}`,
      type: args.type,
      status: "ringing",
      createdAt: Date.now(),
      acceptedBy: undefined,
      endedAt: undefined,
    });
  },
});

export const getActiveForUser = query(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    return null;
  }

  const ringing = await ctx.db
    .query("calls")
    .withIndex("by_status", (q) => q.eq("status", "ringing"))
    .collect();

  const accepted = await ctx.db
    .query("calls")
    .withIndex("by_status", (q) => q.eq("status", "accepted"))
    .collect();

  const active = [...ringing, ...accepted]
    .filter(
      (call) =>
        call.callerId === user._id || call.calleeIds.includes(user._id)
    )
    .sort((a, b) => b.createdAt - a.createdAt)[0];

  if (!active) {
    return null;
  }

  const conversation = await ctx.db.get(active.conversationId);
  const caller = await ctx.db.get(active.callerId);

  return {
    call: active,
    conversation,
    caller,
  };
});

export const getActiveForConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.members.includes(user._id)) {
      return null;
    }

    const calls = await ctx.db
      .query("calls")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    return (
      calls.find((call) => call.status === "accepted") ?? null
    );
  },
});

export const acceptCall = mutation({
  args: { callId: v.id("calls") },
  handler: async (ctx, args) => {
    const current = await getCurrentUser(ctx);
    const call = await ctx.db.get(args.callId);
    if (!call || call.status !== "ringing") {
      throw new Error("Call unavailable");
    }

    if (!call.calleeIds.includes(current._id)) {
      throw new Error("Not invited");
    }

    await ctx.db.patch(call._id, {
      status: "accepted",
      acceptedBy: current._id,
    });
  },
});

export const declineCall = mutation({
  args: { callId: v.id("calls") },
  handler: async (ctx, args) => {
    const current = await getCurrentUser(ctx);
    const call = await ctx.db.get(args.callId);
    if (!call || call.status !== "ringing") {
      return;
    }

    if (!call.calleeIds.includes(current._id)) {
      return;
    }

    await ctx.db.patch(call._id, {
      status: "declined",
      endedAt: Date.now(),
    });
  },
});

export const endCall = mutation({
  args: { callId: v.id("calls") },
  handler: async (ctx, args) => {
    const current = await getCurrentUser(ctx);
    const call = await ctx.db.get(args.callId);
    if (!call || call.status === "ended") {
      return;
    }

    const isParticipant =
      call.callerId === current._id || call.calleeIds.includes(current._id);
    if (!isParticipant) {
      return;
    }

    await ctx.db.patch(call._id, {
      status: "ended",
      endedAt: Date.now(),
    });
  },
});

