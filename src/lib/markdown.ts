import type { Root as MarkdownRoot } from "mdast";
import type { Root as HtmlRoot } from "hast";
import { toText } from "hast-util-to-text";
import { visit } from "unist-util-visit";

function escapeHtml(value: string): string {
	return value.replace(/[&<>"']/g, (character) => {
		const entities: Record<string, string> = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#39;",
		};

		return entities[character];
	});
}

export function codeCaptions() {
	return (tree: MarkdownRoot) => {
		visit(tree, "code", (node, index, parent) => {
			if (index === undefined || !parent || !node.meta) {
				return;
			}

			const label = /label="([^"]+)"/.exec(node.meta)?.[1];
			const file = /file="([^"]+)"/.exec(node.meta)?.[1];

			if (!label) {
				return;
			}

			const caption = `<figure aria-label="A block of code" class="code-block"><figcaption class="code-block__header code-header"><dl class="code-header__info"><dt class="visually-hidden">Language</dt><dd class="code-header__language">${escapeHtml(
				label,
			)}</dd>${
				file
					? `<dt class="visually-hidden">File</dt><dd class="code-header__file">${escapeHtml(
							file,
					  )}</dd>`
					: ""
			}</dl></figcaption>`;

			node.meta = null;

			parent.children.splice(index, 1, { type: "html", value: caption }, node, {
				type: "html",
				value: "</figure>",
			});

			return index + 3;
		});
	};
}

export function headingLinks() {
	return (tree: HtmlRoot) => {
		const used = new Set<string>();

		visit(tree, "element", (node) => {
			if (!/^h[1-6]$/.test(node.tagName)) {
				return;
			}

			// Match markdown-it-anchor's original IDs, including encoded Unicode.
			const slug = encodeURIComponent(
				toText(node).trim().toLowerCase().replace(/\s+/g, "-"),
			);

			let id = slug;

			let suffix = 1;

			while (used.has(id)) {
				id = `${slug}-${suffix++}`;
			}

			used.add(id);
			node.properties.id = id;
			node.properties.tabIndex = -1;
			node.children = [
				{
					type: "element",
					tagName: "a",
					properties: { className: ["header-anchor"], href: `#${id}` },
					children: node.children,
				},
			];
		});
	};
}
