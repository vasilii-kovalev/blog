import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import solid from "@astrojs/solid-js";
import { codeCaptions, headingLinks } from "./src/lib/markdown.ts";

const config = defineConfig({
	site: "https://vasilii-kovalev.github.io",
	base: process.env.NODE_ENV === "production" ? "/blog" : "/",
	trailingSlash: "always",
	compressHTML: true,
	integrations: [solid()],
	markdown: {
		syntaxHighlight: false,
		processor: unified({
			smartypants: false,
			remarkPlugins: [codeCaptions],
			rehypePlugins: [headingLinks],
		}),
	},
});

export default config;
