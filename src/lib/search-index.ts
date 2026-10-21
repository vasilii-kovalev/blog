import { type CollectionEntry, getCollection, render } from "astro:content";

import { type SearchDocument } from "./search-client";

interface SearchIndex {
	documents: Array<SearchDocument>;
	version: string;
}

const getSearchDocument = async (post: CollectionEntry<"posts">): Promise<SearchDocument> => {
	const { headings, remarkPluginFrontmatter } = await render(post);
	const body: unknown = remarkPluginFrontmatter.searchText;

	if (typeof body !== "string") {
		throw new TypeError(`Missing search text for post: ${post.id}`);
	}

	return {
		body,
		description: post.data.description,
		headings: headings
			.map<string>((heading) => {
				return heading.text;
			})
			.join("\n"),
		id: post.id,
		title: post.data.title,
	};
};

const hexRadix = 16;

const getSearchIndex = async (): Promise<SearchIndex> => {
	const posts = await getCollection("posts");
	const documents = await Promise.all(posts.map<Promise<SearchDocument>>(getSearchDocument));
	// The version is a hash of the content, so the index URL changes exactly when the index does.
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(documents)));

	return {
		documents,
		version: new DataView(digest).getUint32(0).toString(hexRadix),
	};
};

export { getSearchIndex };
