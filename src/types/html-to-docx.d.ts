declare module "html-to-docx" {
  interface Options {
    table?: { row?: { cantSplit?: boolean } };
    footer?: boolean;
    pageNumber?: boolean;
    // 🔥 FIX: Added the missing margins type definition
    margins?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
      header?: number;
      footer?: number;
      gutter?: number;
    };
  }

  function HTMLtoDOCX(
    html: string,
    header?: string | null,
    options?: Options
  ): Promise<Buffer>;

  export default HTMLtoDOCX;
}