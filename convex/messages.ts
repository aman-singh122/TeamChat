import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";

type ConvexCtx = MutationCtx | QueryCtx;
const reactionValidator = v.union(
  v.literal("👍"),
  v.literal("❤️"),
  v.literal("😂"),
  v.literal("😮"),
  v.literal("😢")
);

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

    const limit = Math.min(Math.max(args.limit ?? 2000, 50), 5000);
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

export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const message = await ctx.db.get(args.messageId);

    if (!message) {
      throw new Error("Message not found");
    }
    if (message.senderId !== user._id) {
      throw new Error("You can only delete your own messages");
    }
    if (message.deleted) {
      return args.messageId;
    }

    await ctx.db.patch(args.messageId, { deleted: true });
    return args.messageId;
  },
});

export const editMessage = mutation({
  args: { messageId: v.id("messages"), text: v.string() },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const message = await ctx.db.get(args.messageId);

    if (!message) {
      throw new Error("Message not found");
    }
    if (message.senderId !== user._id) {
      throw new Error("You can only edit your own messages");
    }
    if (message.deleted) {
      throw new Error("Deleted messages cannot be edited");
    }

    const nextText = args.text.trim();
    if (!nextText) {
      throw new Error("Message cannot be empty");
    }

    await ctx.db.patch(args.messageId, { text: nextText });
    return args.messageId;
  },
});

export const forwardMessage = mutation({
  args: {
    messageId: v.id("messages"),
    targetConversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const message = await ctx.db.get(args.messageId);

    if (!message || message.deleted) {
      throw new Error("Message not found");
    }

    const sourceConversation = await ctx.db.get(message.conversationId);
    const targetConversation = await ctx.db.get(args.targetConversationId);

    if (!sourceConversation || !sourceConversation.members.includes(user._id)) {
      throw new Error("Source conversation not found");
    }
    if (!targetConversation || !targetConversation.members.includes(user._id)) {
      throw new Error("Target conversation not found");
    }

    const forwardedMessageId = await ctx.db.insert("messages", {
      conversationId: targetConversation._id,
      senderId: user._id,
      text: `Forwarded: ${message.text}`,
      createdAt: Date.now(),
      deleted: false,
    });

    await ctx.db.patch(targetConversation._id, {
      lastMessageAt: Date.now(),
    });

    await ctx.db.insert("messageReads", {
      messageId: forwardedMessageId,
      userId: user._id,
      readAt: Date.now(),
    });

    return forwardedMessageId;
  },
});

export const addReaction = mutation({
  args: {
    messageId: v.id("messages"),
    reaction: reactionValidator,
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const message = await ctx.db.get(args.messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    const conversation = await ctx.db.get(message.conversationId);
    if (!conversation || !conversation.members.includes(user._id)) {
      throw new Error("Conversation not found");
    }

    const existing = await ctx.db
      .query("messageReactions")
      .withIndex("by_message_user_reaction", (q) =>
        q
          .eq("messageId", args.messageId)
          .eq("userId", user._id)
          .eq("reaction", args.reaction)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { active: false };
    }

    await ctx.db.insert("messageReactions", {
      messageId: args.messageId,
      userId: user._id,
      reaction: args.reaction,
    });

    return { active: true };
  },
});

export const reactionsByMessage = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      return null;
    }

    const conversation = await ctx.db.get(message.conversationId);
    if (!conversation || !conversation.members.includes(user._id)) {
      return null;
    }

    const reactions = await ctx.db
      .query("messageReactions")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .collect();

    const counts = new Map<string, number>();
    const mine = new Set<string>();
    for (const entry of reactions) {
      counts.set(entry.reaction, (counts.get(entry.reaction) ?? 0) + 1);
      if (entry.userId === user._id) {
        mine.add(entry.reaction);
      }
    }

    return {
      counts: Array.from(counts.entries()).map(([reaction, count]) => ({
        reaction,
        count,
      })),
      mine: Array.from(mine),
    };
  },
});
