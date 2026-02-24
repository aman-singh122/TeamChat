import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    isOnline: v.boolean(),
    lastSeen: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"]),
  conversations: defineTable({
    isGroup: v.boolean(),
    name: v.optional(v.string()),
    members: v.array(v.id("users")),
    createdAt: v.number(),
    lastMessageAt: v.optional(v.number()),
  })
    .index("by_lastMessageAt", ["lastMessageAt"])
    .index("by_isGroup", ["isGroup"]),
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    text: v.string(),
    createdAt: v.number(),
    deleted: v.boolean(),
  }).index("by_conversation", ["conversationId", "createdAt"]),
  messageReactions: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    reaction: v.union(
      v.literal("👍"),
      v.literal("❤️"),
      v.literal("😂"),
      v.literal("😮"),
      v.literal("😢")
    ),
  })
    .index("by_message", ["messageId"])
    .index("by_message_user_reaction", ["messageId", "userId", "reaction"]),
  messageReads: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    readAt: v.number(),
  })
    .index("by_message", ["messageId"])
    .index("by_user", ["userId"])
    .index("by_message_user", ["messageId", "userId"]),
  typingStatus: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    lastTypingAt: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_conversation_user", ["conversationId", "userId"]),
  calls: defineTable({
    conversationId: v.id("conversations"),
    callerId: v.id("users"),
    calleeIds: v.array(v.id("users")),
    roomName: v.string(),
    type: v.union(v.literal("audio"), v.literal("video")),
    status: v.union(
      v.literal("ringing"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("ended")
    ),
    createdAt: v.number(),
    acceptedBy: v.optional(v.id("users")),
    endedAt: v.optional(v.number()),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_status", ["status"])
    .index("by_caller", ["callerId"]),
});
