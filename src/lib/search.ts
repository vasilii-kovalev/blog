import { fromHtml } from "hast-util-from-html";
import { toText } from "hast-util-to-text";
import { visit } from "unist-util-visit";

interface SearchDocument {
	id: string;
	url: string;
	title: string;
	description: string;
	headings: string;
	body: string;
}

interface SearchIndex {
	version: string;
	documents: Array<SearchDocument>;
}

type ExtractedSearchText = Pick<SearchDocument, "body" | "headings">;

const extractSearchText = (html: string): ExtractedSearchText => {
	const tree = fromHtml(html, { fragment: true });
	const headings: Array<string> = [];

	visit(tree, "element", (node) => {
		if (/^h[1-6]$/u.test(node.tagName)) {
			headings.push(toText(node));
		}
	});

	return {
		body: toText(tree),
		headings: headings.join("\n"),
	};
};

const indexVersion = (date: Date): string => {
	return date
		.toISOString()
		.replace(/\.\d{3}Z$/u, "Z")
		.replace(/[-:]/gu, "");
};

export { extractSearchText, indexVersion, type SearchDocument, type SearchIndex };
