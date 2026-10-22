# Architecture

This document records why the repository is arranged the way it is. What the project is, and how to install and run it, lives in the [README](../README.md).

## Constraints

The site is a personal blog. It ships as static files. There is no server and no third-party service: posts are Markdown files in this repository, and search runs entirely in the browser. Pages stay usable without JavaScript.

Those constraints decide the rest of this document. Hosting has to serve unchanging files under a project-site path. Everything that can be computed ahead of time — post pages, heading anchors, the search index — is computed at build time. The browser receives only the JavaScript that the one interactive feature, search, needs.

## Origin

The blog was built with Eleventy before it moved to Astro. Astro builds on Vite, which is the more familiar tool, and lets the whole project, configuration included, be TypeScript rather than JavaScript.

Several decisions below keep the Eleventy output unchanged, so existing links keep working and posts render as they did before the migration.

## Hosting

GitHub Pages is the only deployment target. It keeps hosting beside the source repository, costs nothing for this project, and avoids a dedicated server. The site is a project site under `https://vasilii-kovalev.github.io/blog/`.

Publishing is a local step: `prod:publish` builds the site, and the `gh-pages` package pushes `dist/` to the root of the `gh-pages` branch. There is no deployment workflow in the repository. A local step is simpler to maintain and operate, and small commits do not start a deployment on every push.

GitHub Pages runs Jekyll on a published branch unless a `.nojekyll` file is present. Jekyll would treat the generated site as source and omit names that start with `_` or `.`, including Astro's `_astro/` assets. Publishing passes `--nojekyll` so Pages serves the tree unchanged. That file is added to the published branch, not to `dist/` on `main`.

`base` is `/blog` in every mode, so the development server uses the same URLs as production. Internal links are built from `import.meta.env.BASE_URL`.

Pages serves a directory's `index.html` at the URL with a trailing slash and redirects the URL without one. Astro writes every page as `<path>/index.html`, and `trailingSlash: "always"` matches that form, so internal links never go through the redirect. With that setting, `BASE_URL` always ends with `/`, and paths are joined with plain template strings.

`build.format: "file"` with `trailingSlash: "never"` would write each post as `posts/<id>.html`. Pages serves that file at `/posts/<id>` and at `/posts/<id>.html`, and returns 404 for `/posts/<id>/`. Links from the Eleventy version end with `/`, so they would break. The home page would still be `index.html`. Pages treats the project site as a directory and redirects `/blog` to `/blog/`. With `trailingSlash: "never"`, `BASE_URL` is `/blog`, and the template-string joins become `/blogposts/…`, `/blogfavicon.ico`, and `/blogsearch-index-….json`. Astro's own asset URLs still include the slash. `astro preview` returns 200 for both `/blog` and `/blog/`, so it does not show the root redirect. The directory output stays.

Pages decides caching on its own. Every file, including content-hashed assets, is served with a ten-minute `Cache-Control: max-age`. `Content-Type` comes from the file extension. Response headers set in an Astro endpoint therefore reach only the development server.

## Content

Posts are a content collection loaded from `src/posts/`. The glob loader turns each file path into a slug, and that slug is both the post's ID and its URL segment, so post URLs need no encoding.

`published` is an ISO date string rather than a `Date`. ISO dates compare correctly as strings, which is how the home page sorts posts newest first. A date-only string parses as midnight UTC, so it is formatted with `timeZone: "UTC"`; formatting in the build machine's time zone could show the previous day.

`tags` comes from the Eleventy version. Nothing reads it yet. It stays for filtering posts by tag once a convenient interface for that is clear.

Astro derives the type of `CollectionEntry<"posts">["data"]` from the schema type of the exported `collections`. An annotation broad enough to cover any collection would erase that type, and Astro does not export its collection config type publicly. The schema is therefore a separate constant, and the `posts` field is typed as `ReturnType<typeof defineCollection<typeof postSchema>>`.

## Markdown

Posts are rendered by Sätteri, Astro's default Markdown processor. The custom transforms are a few small plugins written against Sätteri's own API, so Astro's unified processor, whose advantage is the remark and rehype plugin ecosystem, would only add dependencies. `@astrojs/markdown-satteri` and `satteri` are direct dependencies because the config imports them. Their versions match the ones Astro depends on, so npm installs a single copy, and they move with every Astro upgrade.

Smart punctuation stays off. It would replace straight quotes, hyphens, and `...` with curly quotes, dashes, and `…`, which is closer to print punctuation. The plain characters are common enough on the web, and they are what find-in-page and editors match: `Gauss-Jordan` misses `Gauss–Jordan`. Search engines and other tools that quote or compare a passage can split the same way. Where a curly quote, a dash, or an ellipsis is needed, it is typed into the Markdown, so the source and the page contain the same character and a search or a debug session can use either.

Syntax highlighting is off because the site's look is intentionally minimal: code blocks are plain monospace, without a highlighter's markup or theme. That may change once the design settles.

A plugin adds a permalink to each heading, linking to the id Astro's heading plugin assigns. That plugin is registered first. Astro appends the same plugin after the custom ones and keeps an id that is already set, so the headings returned by `render()` carry it.

A fenced code block gets a caption from its info string: `label="…"` names the language, and an optional `file="…"` names the file. The caption is raw HTML placed around the code node, which is how Sätteri surrounds a node with tags.

Every fenced block declares a language. Post styles tell block code from inline code by the `language-*` class on `<code>`, so a block without a language would be styled as inline code.

Code samples in posts are indented with tabs, while the Markdown prose around them uses spaces, as `.editorconfig` sets. The Oxfmt override and the Markdownlint configuration keep tabs inside code blocks, and the post styles set the tab width.

## Templates

HTML compression uses Astro's default, which applies the JSX whitespace rules: whitespace and line breaks around elements are removed, and whitespace within a single line is kept. Where a space matters between text and an element on the next line, the template writes `{" "}`. The alternative, `compressHTML: true`, is lossless: it shortens each run of whitespace but keeps at least one character wherever the browser might render it, such as between tags. That needs no such care, but leaves slightly larger pages.

Behavior lives in `.ts` modules rather than in `.astro` files. Oxlint lints the scripts in `.astro` files but does not type-check them.

## Search

Search uses MiniSearch with data prepared at build time and searched in the browser. It supports full-text search, field boosts, prefixes, fuzzy matching, and requiring every query term to match across the post's fields. Boosts rank the title above headings, and headings above the body. The [search engine comparison](./search-engine-comparison.md) covers alternatives, maintenance health, and conditions for changing engines.

Results show only a title and a description, which the home page already contains, so the full text of the blog posts does not need to be stored alongside the index. The build creates the MiniSearch index and serializes it, and the browser restores it with `MiniSearch.loadJSON`. The browser does no indexing and never inspects the documents: a malformed file fails inside `loadJSON` and shows the error message. The build and the browser import the MiniSearch options from one module, because an index can only be loaded with the options it was built with.

The searchable text comes from a Sätteri plugin registered after the other custom plugins. It stores the text of the final page tree in the frontmatter that `render()` returns, so the build does not parse the rendered HTML again. Raw HTML is not part of that text, so code captions are not searchable.

The index is served as `search-index-<hash>.json`, where the hash is taken from the serialized index. The home page and the index are separate files that Pages caches independently, so a fixed name could pair a new post list with an old index. A content hash changes exactly when the file changes — because of a post, the processing code, or MiniSearch itself — and stays the same otherwise. The scheme does not depend on Pages' current caching policy: a longer cache lifetime would only make it more useful.

Vite's asset hashing cannot produce that name. The index comes from an endpoint that Astro runs while generating pages, from content collections, after Vite has already hashed the bundled assets. The home page and the endpoint each compute the index, so the computation must stay deterministic: no timestamps or random values. The hash uses the global `crypto.subtle` (Web Crypto), which Node.js implements as browsers do, rather than the `node:crypto` module.

The index loads as soon as the home page does. A `preload` link starts the request in parallel without blocking the main content, so the data is usually there by the time someone starts typing. The link has `crossorigin="anonymous"` because `fetch()` makes CORS-mode requests; without the attribute, the browser cannot reuse the preloaded response and downloads the file twice.

The post list is rendered on the server, newest first, so the page is complete without JavaScript and before the index arrives. The script only reorders and hides those list items by post ID, so the markup stays in the template.

There is no UI framework. The first Astro version rendered search with Solid, chosen because it is closer to React than Svelte, which the article uses. Search is the only interactive feature, though, and a plain script is enough. The script finds its elements by ID and fails fast when a required element is missing, because nothing else checks that the template and the script agree. The checks also narrow the element types.

## Styles

Styles are plain CSS. Modern CSS already provides the features this project needs, including custom properties, without a preprocessor.

`normalize.css` is vendored and imported with `@import` at the top of `common.css`, which keeps it ahead of every other rule. As a JavaScript import, it would be subject to the formatter's import sorting.

The vendored copy differs from upstream in one place: `ui-monospace, monospace` replaces `monospace, monospace`. Both work around browsers shrinking text whose only font family is `monospace`, but Lightning CSS, Vite's CSS minifier, collapses the duplicated keyword and undoes the workaround ([parcel-bundler/lightningcss#1221](https://github.com/parcel-bundler/lightningcss/issues/1221)). Until that is fixed, the change has to survive updates of the file; afterwards, the file can match upstream again.

## Toolchain

### Node.js and npm

Node.js and npm were chosen because they are already familiar and because the rest of the tools run on Node.js anyway.

npm 12 was chosen because its install-time security defaults are stricter than earlier majors. The Node.js range is recorded only in the `devEngines` field — there is no `engines` field, top-level `packageManager` field, or `.node-version` file — and copies npm 12's own `engines.node`, so the two stay aligned. Odd-numbered short-lived lines such as 23 and 25 are omitted. Every allowed version can run TypeScript config files directly, without a compile step. An incompatible version stops the install. Selecting a compatible Node.js and npm version remains a local responsibility.

`.npmrc` sets `save-exact` and `min-release-age=3`. Every dependency and development dependency uses an exact version. The lockfile is committed, and a clean install uses `npm ci`.

`dependencies` lists only code that ships to the browser, which is MiniSearch. Everything else runs at build or development time.

`@astrojs/compiler-rs` is listed directly even though Astro already depends on it: Oxfmt needs it to format `.astro` files and declares it only as an optional peer. Its version has to satisfy both packages.

Small helpers, such as HTML escaping, are written by hand. A general-purpose utility library would replace only a few lines.

### TypeScript

The `typescript` package provides the editor language server and `tsc`; Oxlint's type-aware rules use `oxlint-tsgolint` instead.

Type errors come from two commands. `lint:ts:check` runs Oxlint with type checking, which covers TypeScript files but not `.astro` templates; `astro:check` covers those. Both depend on the types Astro generates in `.astro/`. Any Astro command creates them, `astro:check` included, so on a fresh clone `lint:ts:check` reports a missing `astro:content` module until one has run.

There is no `@types/node`. Build code uses only standard globals that Node.js implements, such as `crypto.subtle` and `TextEncoder`, and TypeScript's DOM library already types them.

`@/` reaches a file under `src/`. Files in nested directories use `@/` because parent-relative imports are forbidden.

### Lint and format

Lint and format commands are plain npm scripts without caching. They run rarely enough that caching would not pay off.

Oxlint and Oxfmt are used for speed. Oxlint enables every category except `nursery`, which the Oxlint docs mark as unstable by design. Oxfmt reads indentation and line width from `.editorconfig`: tabs, with spaces in Markdown. CSpell checks English and Russian because the existing post contains Russian text.

Generated and tooling output lives in `.gitignore`. All tools read `.gitignore`, so the generated `dist/` and `.astro/` directories are skipped. Oxfmt, Stylelint, Markdownlint, and CSpell follow the same ignore file.

Stylelint checks the CSS: Oxlint does not lint it, and Oxfmt formats it without validating it. The configuration is `stylelint.config.mjs`. A TypeScript config would load through Cosmiconfig, and Cosmiconfig 9 does not work with TypeScript 7 without pinning a newer Cosmiconfig. Plain ESM avoids maintaining that pin; the config shape is checked with a JSDoc `@type` instead.
