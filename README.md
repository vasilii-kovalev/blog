# Vasilii Kovalev's blog

Static Astro blog with a Solid home-page search widget. Published to
`https://vasilii-kovalev.github.io/blog/` using `gh-pages`, without GitHub Actions.

## Development

Use a Node.js and npm version allowed by `devEngines` in `package.json`.
The repository uses npm only; `.npmrc` saves exact versions for newly added
packages and enforces a three-day release-age cooldown.

```sh
npm ci
npm start
```

Development serves the site at `/`. Production builds use `/blog/`. Existing
post URLs keep their `/posts/<filename>/` format and trailing slash.

## Build, check, and publish

```sh
npm run build
npm test
npm run preview
npm run publish
```

`build` checks types before generating `dist/`. Run `npm test` after a production
build: the tests cover source utilities and the generated pages and search index.
Preview uses `/blog/`, matching deployment. `publish` builds and pushes the output
to the `gh-pages` branch using `gh-pages -d dist --nojekyll`. The publisher creates
`.nojekyll` so GitHub Pages serves Astro's `_astro` assets unchanged; no source
marker file is needed. Generated output is ignored by Git.

Existing `npm run stylelint:check` and `npm run prettier:check` commands remain
available. Linter/formatter dependency ranges were left unchanged. Astro files
are excluded from Prettier until its separate upgrade adds Astro formatting
support.

## Posts and search

Write Markdown in `src/posts/`. Every post requires `title`, `description`,
`published` (a quoted `YYYY-MM-DD` string), and `tags`. The old Nunjucks `layout`
field is no longer used. Publication dates retain their calendar day and display
as `July 6, 2021`, independent of the build machine's time zone.

Post metadata is validated using Astro's `astro/zod` re-export. No separate
validator dependency or adapter is needed.

Code fences can include a language label and optional file caption:

````md
```typescript label="TypeScript" file="src/example.ts"
const example = "Hello";
```
````

Markdown is no longer evaluated as Nunjucks: literal `{{minLength}}` and
`{{maxLength}}` placeholders in the post's code examples are preserved instead
of being consumed by the template engine.

The home page remains usable without JavaScript. A single post list below the
Posts heading shows all posts until a query filters it; clearing the search
restores all posts. The search bar sits between the heading and this list.
Search additionally matches titles, descriptions, headings, and full post text
(including code), with title/heading boosts and fuzzy matching for typos.

Each build extracts text from the rendered Markdown and generates
`search-index-<UTC timestamp>.json`. The timestamp includes date and time to
seconds, for example `20261021T083921Z`, and is also recorded inside the index.
The home page preloads this file in parallel with its other resources; Solid
initializes search on page load, without waiting for focus. No search code is
shipped on post pages. Loading failures show a retry option while the regular
post list remains available.
