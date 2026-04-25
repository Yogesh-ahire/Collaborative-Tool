import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    title: v.string(),
    initialContent: v.optional(v.any()),
    ownerId: v.string(),
    roomId: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    // 🔥 ADDED THESE BACK FOR SHARE FEATURE
    shareToken: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  })
    .index("by_owner_id", ["ownerId"])
    .index("by_organization_id", ["organizationId"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["ownerId", "organizationId"],
    }),

  //version table
  document_versions: defineTable({
    documentId: v.id("documents"),
    content: v.string(),
    createdBy: v.string(),
    createdAt: v.number(),
    versionNumber: v.number(),
    versionName: v.optional(v.string()),
    isAuto: v.optional(v.boolean()),
  })
  .index("by_document_id", ["documentId"])
  .index("by_document_version", ["documentId", "versionNumber"])
  .index("by_document_auto", ["documentId", "isAuto"]), 
});