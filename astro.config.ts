import { unified } from "@astrojs/markdown-remark";
import solid from "@astrojs/solid-js";
import { defineConfig } from "astro/config";

import rootPackage from "./package.json" with { type: "json" };
import { codeCaptions, headingLinks } from "./src/lib/markdown.ts";

const getBase = (): string => {
	if (process.env.NODE_ENV === "production") {
		return `/${rootPackage.name}`;
	}

	return "/";
};

const config = defineConfig({
	base: getBase(),
	compressHTML: true,
	integrations: [solid()],
	markdown: {
		processor: unified({
			rehypePlugins: [headingLinks],
			remarkPlugins: [codeCaptions],
			smartypants: false,
		}),
		syntaxHighlight: false,
	},
	site: "https://vasilii-kovalev.github.io",
	trailingSlash: "always",
	vite: {
		resolve: {
			tsconfigPaths: true,
		},
	},
});

export default config;
