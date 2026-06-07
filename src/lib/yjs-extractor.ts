// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractRawCRDTData(editor: any) {
  if (!editor) return null;

  let rawYDoc = null;

  const possibleStorages = [
    editor.storage?.liveblocks, 
    editor.storage?.yjs, 
    editor.storage?.collaborative
  ];

  for (const s of possibleStorages) {
    if (s) {
      const doc = s.document || s.yDoc || s.doc || s;
      // 🔥 FIX: Bracket notation bypasses Vercel's strict minification.
      if (doc && doc["store"] && doc["store"]["clients"]) {
        rawYDoc = doc;
        break;
      }
    }
  }

  if (!rawYDoc) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const ext of (editor.extensionManager?.extensions || []) as any[]) {
      if (ext.storage) {
        const doc = ext.storage.document || ext.storage.yDoc || ext.storage.doc || ext.storage.yjs;
        if (doc && doc["store"] && doc["store"]["clients"]) {
          rawYDoc = doc;
          break;
        }
      }
    }
  }

  if (!rawYDoc) {
    console.error("Y.Doc completely hidden by minifier.");
    return null;
  }

  const identityMap = rawYDoc.getMap('user_identities').toJSON() || {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodes: any[] = [];
  const stats: Record<string, { id: string, name: string, added: number, deleted: number, rawClientIds: string[] }> = {};

  const clients = rawYDoc["store"]["clients"];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const [clientId, structs] of clients as Iterable<[any, any[]]>) {
    const cidStr = clientId.toString();
    
    const identity = identityMap[cidStr];
    const uniqueUserId = identity?.id || `unknown-${cidStr}`;
    const rawName = identity?.name || `Archived (${cidStr.slice(-4)})`;

    if (!stats[uniqueUserId]) {
        stats[uniqueUserId] = { 
            id: uniqueUserId, 
            name: rawName, 
            added: 0, 
            deleted: 0, 
            rawClientIds: [] 
        };
    }
    stats[uniqueUserId].rawClientIds.push(cidStr);

    for (const struct of structs) {
      // 🔥 FIX: Vercel renames classes, so `struct.constructor.name === "Item"` evaluates to "t" and fails.
      // Duck-typing avoids this completely.
      if (struct && typeof struct === "object" && "content" in struct && "id" in struct) {
        let rawContent = null;
        try {
            rawContent = struct.content ? (typeof struct.content.getContent === 'function' ? struct.content.getContent() : struct.content) : null;
        } catch {
            rawContent = null;
        }

        let processedContent = "";
        let isFormattingNode = false;

        if (typeof rawContent === "string") {
            processedContent = rawContent;
        } else if (Array.isArray(rawContent)) {
            processedContent = rawContent.map(i => typeof i === 'string' ? i : '').join("");
        } else if (rawContent !== null && typeof rawContent === "object") {
            isFormattingNode = true;
            processedContent = "\n\n"; 
        }

        const length = struct.length || 0;

        if (struct.deleted) {
          stats[uniqueUserId].deleted += length;
        } else {
          stats[uniqueUserId].added += length;
        }

        nodes.push({
          uniqueUserId: uniqueUserId, 
          rawClientId: cidStr,
          clock: struct.id?.clock || 0,
          isDeleted: struct.deleted || false,
          length: length,
          content: processedContent,
          isFormattingNode: isFormattingNode
        });
      }
    }
  }

  return {
    rawNodes: nodes,
    statistics: stats, 
    ydoc: rawYDoc, 
  };
}