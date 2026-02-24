import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getCurrent = query(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  return ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();
});

export const list = query(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return [];
  }

  const current = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();

  const users = await ctx.db.query("users").collect();
  if (!current) {
    return users.sort((a, b) => a.name.localeCompare(b.name));
  }

  return users
    .filter((user) => user._id !== current._id)
    .sort((a, b) => a.name.localeCompare(b.name));
});

export const upsertFromClerk = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }

  const existing = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();

  const name = identity.name ?? identity.nickname ?? "New User";
  const email = identity.email ?? "";
  const image = identity.pictureUrl ?? undefined;
  const now = Date.now();

  if (existing) {
    await ctx.db.patch(existing._id, {
      name,
      email,
      image,
      isOnline: true,
      lastSeen: now,
    });
    return existing._id;
  }

  return ctx.db.insert("users", {
    clerkId: identity.subject,
    name,
    email,
    image,
    isOnline: true,
    lastSeen: now,
  });
});

export const setPresence = mutation({
  args: { isOnline: v.boolean() },
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

    await ctx.db.patch(user._id, {
      isOnline: args.isOnline,
      lastSeen: Date.now(),
    });
  },
});
