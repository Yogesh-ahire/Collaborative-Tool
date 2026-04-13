declare module "html-to-docx" {
  interface Options {
    table?: { row?: { cantSplit?: boolean } };
    footer?: boolean;
    pageNumber?: boolean;
  }

  function HTMLtoDOCX(
    html: string,
    header?: string | null,
    options?: Options
  ): Promise<Buffer>;

  export default HTMLtoDOCX;
}