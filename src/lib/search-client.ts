import MiniSearch from "minisearch";
import type { SearchDocument } from "./search";
export type { SearchIndex } from "./search";

export function createSearch(
	documents: SearchDocument[],
): MiniSearch<SearchDocument> {
	const search = new MiniSearch<SearchDocument>({
		fields: ["title", "description", "headings", "body"],
		storeFields: ["title", "description", "url"],
		searchOptions: {
			boost: { title: 30, headings: 20 },
			combineWith: "AND",
			prefix: true,
			fuzzy: 0.2,
		},
	});

	search.addAll(documents);

	return search;
}
