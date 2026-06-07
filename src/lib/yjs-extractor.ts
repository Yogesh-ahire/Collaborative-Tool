// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractRawCRDTData(editor: any, currentUser: any) {
  if (!editor || !currentUser) return null;

  try {
    const json = editor.getJSON();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nodes: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stats: Record<string, any> = {};

    // Map Active User 
    const userId = currentUser.id || "unknown";
    let userName = currentUser.info?.name || currentUser.info?.email || "Local User";
    if (userName.includes('@')) {
      const prefix = userName.split('@')[0];
      userName = prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase();
    }

    let totalAdded = 0;

    // Recursively walk Tiptap JSON to construct flow blocks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const walk = (node: any) => {
      if (node.type === "text" && node.text) {
        totalAdded += node.text.length;
        nodes.push({
          uniqueUserId: userId,
          rawClientId: userId,
          clock: Date.now() + Math.random(), 
          isDeleted: false,
          length: node.text.length,
          content: node.text,
          isFormattingNode: false
        });
      } else if (node.type === "paragraph" || node.type === "heading") {
        nodes.push({
          uniqueUserId: userId,
          rawClientId: userId,
          clock: Date.now() + Math.random(),
          isDeleted: false,
          length: 0,
          content: "\n\n",
          isFormattingNode: true
        });
      }
      
      if (node.content) {
        node.content.forEach(walk);
      }
    };

    if (json.content) {
      json.content.forEach(walk);
    }

    stats[userId] = {
      id: userId,
      name: userName,
      added: totalAdded,
      deleted: 0,
      rawClientIds: [userId]
    };

    return {
      rawNodes: nodes,
      statistics: stats,
      isValid: true, 
    };
  } catch (error) {
    console.error("Extraction Parsing Error:", error);
    return null;
  }
}