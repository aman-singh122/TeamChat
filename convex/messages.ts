import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";

type ConvexCtx = MutationCtx | QueryCtx;

async function requireCurrentUser(ctx: ConvexCtx) {
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

export const listByConversation = query({
  args: { conversationId: v.id("conversations"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.members.includes(user._id)) {
      return [];
    }

    const limit = args.limit ?? 50;
    return ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .take(limit);
  },
});

export const sendMessage = mutation({
  args: { conversationId: v.id("conversations"), text: v.string() },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.members.includes(user._id)) {
      throw new Error("Conversation not found");
    }

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: user._id,
      text: args.text,
      createdAt: Date.now(),
      deleted: false,
    });

    await ctx.db.patch(conversation._id, {
      lastMessageAt: Date.now(),
    });

    await ctx.db.insert("messageReads", {
      messageId,
      userId: user._id,
      readAt: Date.now(),
    });

    return messageId;
  },
});

export const markConversationRead = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.members.includes(user._id)) {
      throw new Error("Conversation not found");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    for (const message of messages) {
      const existing = await ctx.db
        .query("messageReads")
        .withIndex("by_message_user", (q) =>
          q.eq("messageId", message._id).eq("userId", user._id)
        )
        .unique();

      if (!existing) {
        await ctx.db.insert("messageReads", {
          messageId: message._id,
          userId: user._id,
          readAt: Date.now(),
        });
      }
    }
  },
});

export const unreadCount = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.members.includes(user._id)) {
      return 0;
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    let unread = 0;
    for (const message of messages) {
      if (message.deleted) {
        continue;
      }
      if (message.senderId === user._id) {
        continue;
      }
      const read = await ctx.db
        .query("messageReads")
        .withIndex("by_message_user", (q) =>
          q.eq("messageId", message._id).eq("userId", user._id)
        )
        .unique();
      if (!read) {
        unread += 1;
      }
    }

    return unread;
  },
});

export const unreadMessages = query({
  args: { conversationId: v.id("conversations"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.members.includes(user._id)) {
      return [];
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .take(args.limit ?? 200);

    const unread: typeof messages = [];
    for (const message of messages) {
      if (message.deleted) {
        continue;
      }
      if (message.senderId === user._id) {
        continue;
      }
      const read = await ctx.db
        .query("messageReads")
        .withIndex("by_message_user", (q) =>
          q.eq("messageId", message._id).eq("userId", user._id)
        )
        .unique();
      if (!read) {
        unread.push(message);
      }
    }

    return unread;
  },
});
