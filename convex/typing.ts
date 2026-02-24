import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const TYPING_TTL_MS = 2000;

export const setTyping = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
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

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.members.includes(user._id)) {
      throw new Error("Conversation not found");
    }

    const existing = await ctx.db
      .query("typingStatus")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", user._id)
      )
      .unique();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { lastTypingAt: now });
    } else {
      await ctx.db.insert("typingStatus", {
        conversationId: args.conversationId,
        userId: user._id,
        lastTypingAt: now,
      });
    }
  },
});

export const listTyping = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.members.includes(user._id)) {
      return [];
    }

    const records = await ctx.db
      .query("typingStatus")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const cutoff = Date.now() - TYPING_TTL_MS;
    return records.filter(
      (record) => record.userId !== user._id && record.lastTypingAt > cutoff
    );
  },
});
