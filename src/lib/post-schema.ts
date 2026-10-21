import { z } from "astro/zod";

import { isPublicationDate } from "./posts.ts";

export const postSchema = z.object({
	description: z.string().min(1),
	published: z.string().refine(isPublicationDate, "Expected a valid YYYY-MM-DD date"),
	tags: z.array(z.string()),
	title: z.string().min(1),
});
