declare module 'markdown' {
  interface MarkdownObject {
    Markdown: any;
    parse: (text: string) => any;
    toHTML: (text: string) => string;
    toHTMLTree: (text: string) => any;
    renderJsonML: (tree: any) => string;
  }
  
  export const markdown: MarkdownObject;
  export function parse(text: string): any;
} 