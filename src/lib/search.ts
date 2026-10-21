import { fromHtml } from "hast-util-from-html";
import { toText } from "hast-util-to-text";
import { visit } from "unist-util-visit";

export interface SearchDocument {
	id: string;
	url: string;
	title: string;
	description: string;
	headings: string;
	body: string;
}

export interface SearchIndex {
	version: string;
	documents: SearchDocument[];
}

export function extractSearchText(html: string): {
	body: string;
	headings: string;
} {
	const tree = fromHtml(html, { fragment: true });
	const headings: string[] = [];

	visit(tree, "element", (node) => {
		if (/^h[1-6]$/.test(node.tagName)) {
			headings.push(toText(node));
		}
	});

	return { body: toText(tree), headings: headings.join("\n") };
}

export function indexVersion(date: Date): string {
	return date
		.toISOString()
		.replace(/\.\d{3}Z$/, "Z")
		.replace(/[-:]/g, "");
}
