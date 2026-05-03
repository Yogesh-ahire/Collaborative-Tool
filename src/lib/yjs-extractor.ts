// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractRawCRDTData(editor: any) {
  if (!editor) return null;

  let rawYDoc = null;

  const possibleStorages = [
    editor.storage.liveblocks, 
    editor.storage.yjs, 
    editor.storage.collaborative
  ];

  for (const s of possibleStorages) {
    if (s) {
      const doc = s.document || s.yDoc || s.doc || s;
      if (doc && doc.store && doc.store.clients) {
        rawYDoc = doc;
        break;
      }
    }
  }

  if (!rawYDoc) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const ext of editor.extensionManager.extensions as any[]) {
      if (ext.storage) {
        const doc = ext.storage.document || ext.storage.yDoc || ext.storage.doc || ext.storage.yjs;
        if (doc && doc.store && doc.store.clients) {
          rawYDoc = doc;
          break;
        }
      }
    }
  }

  if (!rawYDoc) {
    console.error("Y.Doc completely hidden by Liveblocks.");
    return null;
  }

  const identityMap = rawYDoc.getMap('user_identities').toJSON() || {};
  const nodes = [];
  const stats: Record<string, { id: string, name: string, added: number, deleted: number, rawClientIds: string[] }> = {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const [clientId, structs] of rawYDoc.store.clients as Iterable<[string, any[]]>) {
    const cidStr = clientId.toString();
    
    // 1. STRICT DEDUPLICATION: Map directly to Clerk ID.
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

    // 2. EXTRACT CONTENT & KILL [object Object] AT THE ROOT
    for (const struct of structs) {
      if (struct.constructor.name === "Item") {
        let rawContent = null;
        try {
            rawContent = struct.content ? struct.content.getContent() : null;
        } catch {
            rawContent = null;
        }

        let processedContent = "";
        let isFormattingNode = false;

        if (typeof rawContent === "string") {
            processedContent = rawContent;
        } else if (Array.isArray(rawContent)) {
            // Join only valid strings, ignore nested objects
            processedContent = rawContent.map(i => typeof i === 'string' ? i : '').join("");
        } else if (rawContent !== null && typeof rawContent === "object") {
            isFormattingNode = true;
            processedContent = "\n\n"; // Hardcode structural break
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
          clock: struct.id.clock,
          isDeleted: struct.deleted,
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