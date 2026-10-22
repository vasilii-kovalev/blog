import { defineConfig } from "oxfmt";

// Indentation and line width come from `.editorconfig`.
const config = defineConfig({
	astro: true,
	experimentalOperatorPosition: "start",
	overrides: [
		{
			// Markdown prose uses spaces (see `.editorconfig`), but code blocks keep tabs.
			files: ["*.md"],
			options: {
				useTabs: true,
			},
		},
		{
			// The default would put a trailing comma back into this JSONC file.
			files: [".markdownlint-cli2.jsonc"],
			options: {
				trailingComma: "none",
			},
		},
	],
	sortImports: {
		groups: ["builtin", "external", "internal", ["parent", "sibling", "index"]],
		sortSideEffects: true,
	},
});

export default config;
