import { SiteScript } from "./SiteScript";

/*
  Renders a marketing page built from the imported static design:
  links the design's stylesheets, injects the processed page markup,
  and loads its vanilla JS. Used by every public marketing route.
*/
export function SiteShell({ html }: { html: string }) {
  return (
    <>
      <link rel="stylesheet" href="/site/styles/tokens.css" />
      <link rel="stylesheet" href="/site/styles/base.css" />
      <link rel="stylesheet" href="/site/styles/components.css" />
      <link rel="stylesheet" href="/site/styles/pages.css" />
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <SiteScript />
    </>
  );
}
