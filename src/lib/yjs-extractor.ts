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
    console.error("Y.Doc completely hidden by Liveblocks. Registered extensions:", 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      editor.extensionManager.extensions.map((e: any) => e.name)
    );
    return null;
  }

  const nodes = [];
  const stats: Record<string, { added: number; deleted: number }> = {};

  for (const [clientId, structs] of rawYDoc.store.clients) {
    if (!stats[clientId]) stats[clientId] = { added: 0, deleted: 0 };

    for (const struct of structs) {
      if (struct.constructor.name === "Item") {
        const contentStr = struct.content ? struct.content.getContent() : null;
        const length = struct.length || 0;

        if (struct.deleted) {
          stats[clientId].deleted += length;
        } else {
          stats[clientId].added += length;
        }

        nodes.push({
          clientId: clientId.toString(),
          clock: struct.id.clock,
          isDeleted: struct.deleted,
          length: length,
          content: contentStr,
        });
      }
    }
  }

  return {
    rawNodes: nodes,
    statistics: stats,
  };
}