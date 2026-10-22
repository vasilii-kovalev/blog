import { satteri, satteriHeadingIdsPlugin } from "@astrojs/markdown-satteri";
import { defineConfig } from "astro/config";

import { codeCaptions, headingLinks, searchText } from "./src/lib/markdown.ts";

const config = defineConfig({
	base: "/blog",
	markdown: {
		processor: satteri({
			features: {
				smartPunctuation: false,
			},
			// Heading ids are assigned before the permalinks read them. `searchText` goes last, so it reads the final text of the page.
			hastPlugins: [satteriHeadingIdsPlugin(), headingLinks, searchText],
			mdastPlugins: [codeCaptions],
		}),
		syntaxHighlight: false,
	},
	site: "https://vasilii-kovalev.github.io",
	trailingSlash: "always",
});

export default config;
