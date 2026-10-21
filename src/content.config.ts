import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

const postSchema = z.object({
	description: z.string().min(1),
	published: z.iso.date(),
	tags: z.array(z.string()),
	title: z.string().min(1),
});

const posts = defineCollection({
	loader: glob({
		base: "./src/posts",
		pattern: "**/*.md",
	}),
	schema: postSchema,
});

interface Collections {
	// Astro infers the type of `CollectionEntry<"posts">["data"]` from the `schema` of this config.
	posts: ReturnType<typeof defineCollection<typeof postSchema>>;
}

const collections: Collections = {
	posts,
};

export { collections };
