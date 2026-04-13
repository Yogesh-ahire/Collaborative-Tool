export  type JSONContent = {
  type: string;
  content?: JSONContent[];
  text?: string;
  attrs?: Record<string, unknown>;
};