import { getCollection } from "astro:content";

import { postUrl } from "./posts";
import { extractSearchText, indexVersion, type SearchIndex } from "./search";

let index: Promise<SearchIndex> | null = null;
const version = indexVersion(new Date());

const buildSearchIndex = async (): Promise<SearchIndex> => {
	const posts = await getCollection("posts");

	return {
		documents: posts.map((post) => {
			if (!post.rendered) {
				throw new Error(`Missing rendered content for post: ${post.id}`);
			}

			return {
				description: post.data.description,
				id: post.id,
				title: post.data.title,
				url: postUrl(post.id, import.meta.env.BASE_URL),
				...extractSearchText(post.rendered.html),
			};
		}),
		version,
	};
};

const getSearchIndex = async (): Promise<SearchIndex> => {
	if (import.meta.env.DEV) {
		return buildSearchIndex();
	}

	// Share one build timestamp between the home page and the static endpoint.
	index ??= buildSearchIndex();

	const result = await index;

	return result;
};

export { getSearchIndex };
