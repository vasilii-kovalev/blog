import { type Options } from "minisearch";

interface SearchDocument {
	id: string;
	title: string;
	description: string;
	headings: string;
	body: string;
}

// The build creates the index and the browser loads it, so both must use the same options.
const miniSearchOptions: Options<SearchDocument> = {
	fields: ["title", "description", "headings", "body"],
	searchOptions: {
		boost: {
			headings: 20,
			title: 30,
		},
		combineWith: "AND",
		fuzzy: 0.2,
		prefix: true,
	},
};

export { miniSearchOptions, type SearchDocument };
