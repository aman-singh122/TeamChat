// import { mutation, query } from "convex/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getById = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || !conversation.members.includes(user._id)) {
      return null;
    }

    const members = await Promise.all(
      conversation.members.map((memberId) => ctx.db.get(memberId))
    );

    return {
      conversation,
      members: members.filter(Boolean),
    };
  },
});

export const listForUser = query(async (ctx) => {
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

  const conversations = await ctx.db.query("conversations").collect();
  return conversations
    .filter((conversation) => conversation.members.includes(user._id))
    .sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0));
});

export const listSidebar = query(async (ctx) => {
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

  const conversations = await ctx.db.query("conversations").collect();
  const scoped = conversations
    .filter((conversation) => conversation.members.includes(user._id))
    .sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0));

  const results = [];
  for (const conversation of scoped) {
    const lastMessage = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", conversation._id)
      )
      .order("desc")
      .first();

    const memberProfiles = await Promise.all(
      conversation.members.map((memberId) => ctx.db.get(memberId))
    );

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", conversation._id)
      )
      .collect();

    let unread = 0;
    for (const message of messages) {
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
    results.push({
      conversation,
      members: memberProfiles.filter(Boolean),
      lastMessage,
      unread,
    });
  }

  return results;
});

export const createDirectConversation = mutation({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const current = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!current) {
      throw new Error("User not found");
    }

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_isGroup", (q) => q.eq("isGroup", false))
      .collect();

    const existing = conversations.find(
      (conversation) =>
        conversation.members.length === 2 &&
        conversation.members.includes(current._id) &&
        conversation.members.includes(args.otherUserId)
    );

    if (existing) {
      return existing._id;
    }

    return ctx.db.insert("conversations", {
      isGroup: false,
      name: undefined,
      members: [current._id, args.otherUserId],
      createdAt: Date.now(),
      lastMessageAt: undefined,
    });
  },
});

export const createGroupConversation = mutation({
  args: {
    name: v.string(),
    memberIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const current = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!current) {
      throw new Error("User not found");
    }

    const members = Array.from(
      new Set([current._id, ...args.memberIds])
    );

    return ctx.db.insert("conversations", {
      isGroup: true,
      name: args.name,
      members,
      createdAt: Date.now(),
      lastMessageAt: undefined,
    });
  },
});

export const renameGroup = mutation({
  args: { conversationId: v.id("conversations"), name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    await ctx.db.patch(conversation._id, { name: args.name });
  },
});
