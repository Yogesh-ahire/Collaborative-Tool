import { ConvexError } from "convex/values";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

import { mutation, query } from "./_generated/server";

export const getByIds = query({
  args: { ids: v.array(v.id("documents")) },
  handler: async (ctx, { ids }) => {
    const documents = [];

    for (const id of ids) {
      const document = await ctx.db.get(id);

      if (document) {
        documents.push({ id: document._id, name: document.title });
      } else {
        documents.push({ id, name: "[Removed]" });
      }
    }

    return documents;
  },
});

export const create = mutation({
  args: {
    title: v.optional(v.string()),
    initialContent: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    const organizationId = (user.organization_id ?? undefined) as
      | string
      | undefined;

    return await ctx.db.insert("documents", {
      title: args.title ?? "Untitled Document",
      ownerId: user.subject,
      organizationId,
      initialContent: args.initialContent,
    });
  },
});

export const get = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
  },
  handler: async (ctx, { search, paginationOpts }) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError("Unauthorized!");
    }

    const organizationId = (user.organization_id ?? undefined) as
      | string
      | undefined;

    if (search && organizationId) {
      return await ctx.db
        .query("documents")
        .withSearchIndex("search_title", (q) =>
          q.search("title", search).eq("organizationId", organizationId)
        )
        .paginate(paginationOpts);
    }

    if (search) {
      return await ctx.db
        .query("documents")
        .withSearchIndex("search_title", (q) =>
          q.search("title", search).eq("ownerId", user.subject)
        )
        .paginate(paginationOpts);
    }

    if (organizationId) {
      return await ctx.db
        .query("documents")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", organizationId)
        )
        .paginate(paginationOpts);
    }

    return await ctx.db
      .query("documents")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", user.subject))
      .paginate(paginationOpts);
  },
});

export const removeById = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError("Unauthorized!");
    }

    const organizationId = (user.organization_id ?? undefined) as
      | string
      | undefined;

    const document = await ctx.db.get(args.id);

    if (!document) {
      throw new ConvexError("Document not found!");
    }

    const isOwner = document.ownerId === user.subject;
    const isOrganizationMember =
      !!(document.organizationId &&
        document.organizationId === organizationId);

    if (!isOwner && !isOrganizationMember) {
      throw new ConvexError("Unauthorized");
    }

    return await ctx.db.delete(args.id);
  },
});

export const updateById = mutation({
  args: { id: v.id("documents"), title: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError("Unauthorized!");
    }

    const organizationId = (user.organization_id ?? undefined) as
      | string
      | undefined;

    const document = await ctx.db.get(args.id);

    if (!document) {
      throw new ConvexError("Document not found!");
    }

    const isOwner = document.ownerId === user.subject;
    const isOrganizationMember =
      !!(document.organizationId &&
        document.organizationId === organizationId);

    if (!isOwner && !isOrganizationMember) {
      throw new ConvexError("Unauthorized");
    }

    return await ctx.db.patch(args.id, { title: args.title });
  },
});

export const getById = query({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    const organizationId = (user.organization_id ?? undefined) as
      | string
      | undefined;

    const document = await ctx.db.get(id);

    if (!document) {
      throw new ConvexError("Document not found");
    }

    const isOwner = document.ownerId === user.subject;
    const isOrganizationMember =
      !!(document.organizationId &&
        document.organizationId === organizationId);

    if (!isOwner && !isOrganizationMember) {
      throw new ConvexError("Unauthorized");
    }

    return document;
  },
});

export const createVersion = mutation({
  args: {
    documentId: v.id("documents"),
    // 🔥 FIX: Taking string payload from the client to skip network validation crashes
    content: v.string(),
    versionName: v.optional(v.string()),
    isAuto: v.optional(v.boolean()),
  },
  handler: async (ctx, { documentId, content, versionName, isAuto }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new ConvexError("Unauthorized");

    const latest = await ctx.db
      .query("document_versions")
      .withIndex("by_document_version", (q) =>
        q.eq("documentId", documentId)
      )
      .order("desc")
      .first();

    const versionNumber = latest ? latest.versionNumber + 1 : 1;

    const inserted = await ctx.db.insert("document_versions", {
      documentId,
      content,
      createdBy: user.name || user.email || user.subject,
      createdAt: Date.now(),
      versionNumber,
      versionName,
      isAuto: isAuto ?? false,
    });

    if (isAuto) {
      const autos = await ctx.db
        .query("document_versions")
        .withIndex("by_document_auto", (q) =>
          q.eq("documentId", documentId).eq("isAuto", true)
        )
        .order("desc")
        .collect();

      const MAX_AUTO = 15;

      if (autos.length > MAX_AUTO) {
        const toDelete = autos.slice(MAX_AUTO);
        for (const v of toDelete) {
          await ctx.db.delete(v._id);
        }
      }
    }

    return inserted;
  },
});

export const getVersions = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    return await ctx.db
      .query("document_versions")
      .withIndex("by_document_id", (q) =>
        q.eq("documentId", documentId)
      )
      .order("desc")
      .collect();
  },
});

export const restoreVersion = mutation({
  args: {
    versionId: v.id("document_versions"),
  },
  handler: async (ctx, { versionId }) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    const version = await ctx.db.get(versionId);

    if (!version) {
      throw new ConvexError("Version not found");
    }

    return {
      content: version.content,
    };
  },
});

//share link
// 🔥 ADD THESE TO THE VERY END OF convex/documents.ts
export const generateShareLink = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new ConvexError("Unauthorized");

    const doc = await ctx.db.get(documentId);
    if (!doc) throw new ConvexError("Not found");

    if (doc.ownerId !== user.subject) {
      throw new ConvexError("Not allowed");
    }

    const token = crypto.randomUUID();

    await ctx.db.patch(documentId, {
      shareToken: token,
      isPublic: true,
    });

    return token;
  },
});

export const getByShareToken = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const doc = await ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("shareToken"), token))
      .first();

    if (!doc || !doc.isPublic) {
      return null; // Return null instead of error to prevent Next.js client crashes
    }

    return doc;
  },
});