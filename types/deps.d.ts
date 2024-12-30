// This module should contain type definitions for modules which do not have
// their own type definitions and are not available on DefinitelyTyped.

// declare module 'some-untyped-pkg' {
// 	export function foo(): void;
// }

// This is for createing a sitemap on node env using `<renderToReadableStream />`
declare module 'react-dom/server.edge' {
  export * from 'react-dom/server'
}

declare module 'virtual:parse-markdown-frontmatter' {
  export const metadatas: Array<{
    path: string
    filename: string
    data: Record<string, unknown>
  }>
}
