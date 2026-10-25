# Vasilii Kovalev's blog

Why the repository is arranged this way is in [`docs/architecture.md`](./docs/architecture.md).

## Installation

### Node.js and npm

The root `package.json` `devEngines` field requires:

- Node.js `^22.22.2 || ^24.15.0 || >=26.0.0`
- npm `^12.0.0`

Incompatible versions fail at install.

### Setup

From the repository root, run the following commands to install dependencies:

```sh
npm ci
```

## Scripts

- `dev` — Run the development server.
- `prod:build` — Build the production site.
- `prod:preview` — Serve the production build locally.
- `prod:publish` — Build the site and publish it to GitHub Pages.
- `astro:check` — Type-check Astro components and the rest of the project.
- `format:check` — Check formatting.
- `format:fix` — Apply formatting.
- `lint:css:check` — Check CSS.
- `lint:css:fix` — Fix CSS lint issues.
- `lint:markdown:check` — Check Markdown.
- `lint:markdown:fix` — Fix Markdown lint issues.
- `lint:spell:check` — Check spelling and report unused words in the CSpell configuration.
- `lint:ts:check` — Lint TypeScript and report type errors.
- `lint:ts:fix` — Apply TypeScript lint fixes.
- `check-and-fix` — Run project checks and apply automatic fixes.

## Recommended extensions

The workspace recommends these extensions. The same list is in
[`.vscode/extensions.json`](./.vscode/extensions.json):

- Astro
- Code Spell Checker
- EditorConfig
- Oxc
- rumdl
- Russian - Code Spell Checker
- Stylelint

## External resources and inspirations

- [How to add fast, client-side search to Astro static sites](https://evilmartians.com/chronicles/how-to-add-fast-client-side-search-to-astro-static-sites)

## License

The source code, this README, the files in [`docs/`](./docs), and code samples in the blog posts are licensed under the [MIT License](./LICENSE).

The prose of the blog posts and the original graphics, including the favicons, are © 2021 Vasilii Kovalev.
