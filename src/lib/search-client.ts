import MiniSearch from "minisearch";

import { type SearchDocument, type SearchIndex } from "./search";

interface SearchEngine {
	search: (query: string) => Array<SearchDocument>;
}

const parseSearchIndex = (value: unknown): SearchIndex => {
	if (
		typeof value !== "object" ||
		value === null ||
		!("version" in value) ||
		typeof value.version !== "string" ||
		!("documents" in value) ||
		!Array.isArray(value.documents)
	) {
		throw new Error("Invalid search index.");
	}

	const documents: Array<unknown> = value.documents;
	const isDocument = (document: unknown): document is SearchDocument => {
		return (
			typeof document === "object" &&
			document !== null &&
			"id" in document &&
			typeof document.id === "string" &&
			"url" in document &&
			typeof document.url === "string" &&
			"title" in document &&
			typeof document.title === "string" &&
			"description" in document &&
			typeof document.description === "string" &&
			"headings" in document &&
			typeof document.headings === "string" &&
			"body" in document &&
			typeof document.body === "string"
		);
	};

	if (!documents.every(isDocument)) {
		throw new Error("Invalid search index documents.");
	}

	return { documents, version: value.version };
};

const createSearch = (documents: Array<SearchDocument>): SearchEngine => {
	const documentsById = new Map(
		documents.map((document) => {
			return [document.id, document];
		}),
	);
	const search = new MiniSearch<SearchDocument>({
		fields: ["title", "description", "headings", "body"],
		searchOptions: {
			boost: { headings: 20, title: 30 },
			combineWith: "AND",
			fuzzy: 0.2,
			prefix: true,
		},
		storeFields: ["title", "description", "url"],
	});

	search.addAll(documents);

	return {
		search: (query) => {
			return search.search(query).map((result) => {
				if (typeof result.id !== "string") {
					throw new Error("Invalid search result ID.");
				}

				const document = documentsById.get(result.id);

				if (!document) {
					throw new Error(`Missing search document: ${result.id}`);
				}

				return document;
			});
		},
	};
};

export { createSearch, parseSearchIndex, type SearchEngine };
