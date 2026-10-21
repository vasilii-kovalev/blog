import { defineConfig } from "oxfmt";

// Indentation and line width come from `.editorconfig`.
const config = defineConfig({
	astro: true,
	overrides: [
		{
			// Markdown prose uses spaces (see `.editorconfig`), but code blocks keep tabs.
			files: ["*.md"],
			options: {
				useTabs: true,
			},
		},
	],
	sortImports: {
		groups: ["builtin", "external", "internal", ["parent", "sibling", "index"]],
		sortSideEffects: true,
	},
});

export default config;
