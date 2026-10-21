import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";

import { postSchema } from "./lib/post-schema";

const posts = defineCollection({
	loader: glob({
		base: "./src/posts",
		pattern: "**/*.md",
	}),
	schema: postSchema,
});

export const collections = { posts };
