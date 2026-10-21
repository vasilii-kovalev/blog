import { getCollection } from "astro:content";
import { extractSearchText, indexVersion } from "./search";
import type { SearchIndex } from "./search";
import { postUrl } from "./posts";

let index: Promise<SearchIndex> | undefined;
const version = indexVersion(new Date());

export function getSearchIndex(): Promise<SearchIndex> {
	if (import.meta.env.DEV) {
		return buildSearchIndex();
	}

	// Share one build timestamp between the home page and the static endpoint.
	index ??= buildSearchIndex();

	return index;
}

async function buildSearchIndex(): Promise<SearchIndex> {
	const posts = await getCollection("posts");
	return {
		version,
		documents: posts.map((post) => {
			if (!post.rendered) {
				throw new Error(`Missing rendered content for post: ${post.id}`);
			}

			return {
				id: post.id,
				url: postUrl(post.id, import.meta.env.BASE_URL),
				title: post.data.title,
				description: post.data.description,
				...extractSearchText(post.rendered.html),
			};
		}),
	};
}
