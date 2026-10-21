import { satteri } from "@astrojs/markdown-satteri";
import { defineConfig } from "astro/config";

import { codeCaptions, headingLinks, searchText } from "./src/lib/markdown.ts";

const config = defineConfig({
	base: "/blog",
	compressHTML: true,
	markdown: {
		processor: satteri({
			features: {
				smartPunctuation: false,
			},
			// `searchText` goes last, so it reads the final text of the page.
			hastPlugins: [headingLinks, searchText],
			mdastPlugins: [codeCaptions],
		}),
		syntaxHighlight: false,
	},
	site: "https://vasilii-kovalev.github.io",
	trailingSlash: "always",
});

export default config;
