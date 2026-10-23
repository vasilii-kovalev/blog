import { satteri, satteriHeadingIdsPlugin } from "@astrojs/markdown-satteri";
import { defineConfig } from "astro/config";
import sonda from "sonda/vite";
import { type PluginOption } from "vite";

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
	vite: {
		build: {
			// Sonda reads the source map when it reports the bundle.
			sourcemap: true,
		},
		plugins: [
			/*
				Astro 7 calls `astro:build:setup` once, with target `server`, before the environment builds.
				`sonda/astro` adds its plugin from that hook for a client target, or for the server target when `server` is set.
				This wrapper runs the Vite plugin for the client environment only. The build that renders the pages is deleted after they are written.
			*/
			{
				apply: "build",
				applyToEnvironment: (environment): PluginOption => {
					if (environment.name !== "client") {
						return false;
					}

					return sonda();
				},
				enforce: "pre",
				name: "sonda-client",
			},
		],
	},
});

export default config;
