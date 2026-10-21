import { type Root as HtmlRoot } from "hast";
import { toText } from "hast-util-to-text";
import { type Code, type Root as MarkdownRoot, type Parent } from "mdast";
import { visit } from "unist-util-visit";

const escapeHtml = (value: string): string => {
	return value.replace(/[&<>"']/gu, (character) => {
		const entities: Record<string, string> = {
			'"': "&quot;",
			"&": "&amp;",
			"'": "&#39;",
			"<": "&lt;",
			">": "&gt;",
		};

		return entities[character];
	});
};

const getCaptionParts = (meta: string): { file: string | null; label: string | null } => {
	return {
		file: /file="(?<file>[^"]+)"/u.exec(meta)?.groups?.file ?? null,
		label: /label="(?<label>[^"]+)"/u.exec(meta)?.groups?.label ?? null,
	};
};

const createCodeCaption = (label: string, file: string | null): string => {
	let fileCaption = "";

	if (file !== null) {
		fileCaption = `<dt class="visually-hidden">File</dt><dd class="code-header__file">${escapeHtml(file)}</dd>`;
	}

	return `<figure aria-label="A block of code" class="code-block"><figcaption class="code-block__header code-header"><dl class="code-header__info"><dt class="visually-hidden">Language</dt><dd class="code-header__language">${escapeHtml(
		label,
	)}</dd>${fileCaption}</dl></figcaption>`;
};

const captionNodeCount = 3;

const addCodeCaption = (node: Code, index: number, parent: Parent): number => {
	const { meta } = node;

	if (typeof meta !== "string" || meta === "") {
		return index;
	}

	const { file, label } = getCaptionParts(meta);

	if (label === null) {
		return index;
	}

	const caption = createCodeCaption(label, file);
	node.meta = null;

	parent.children.splice(index, 1, { type: "html", value: caption }, node, {
		type: "html",
		value: "</figure>",
	});

	return index + captionNodeCount;
};

const codeCaptions = (): ((tree: MarkdownRoot) => void) => {
	return (tree: MarkdownRoot): void => {
		visit(tree, "code", (node, index, parent) => {
			if (typeof index !== "number" || !parent) {
				return 0;
			}

			return addCodeCaption(node, index, parent);
		});
	};
};

const getHeadingId = (slug: string, used: Set<string>): string => {
	let id = slug;
	let suffix = 1;

	while (used.has(id)) {
		id = `${slug}-${suffix}`;
		suffix += 1;
	}

	used.add(id);
	return id;
};

const headingLinks = (): ((tree: HtmlRoot) => void) => {
	return (tree: HtmlRoot): void => {
		const used = new Set<string>();

		visit(tree, "element", (node) => {
			if (!/^h[1-6]$/u.test(node.tagName)) {
				return;
			}

			// Match markdown-it-anchor's original IDs, including encoded Unicode.
			const slug = encodeURIComponent(toText(node).trim().toLowerCase().replace(/\s+/gu, "-"));

			const id = getHeadingId(slug, used);

			node.properties.id = id;
			node.properties.tabIndex = -1;
			node.children = [
				{
					children: node.children,
					properties: { className: ["header-anchor"], href: `#${id}` },
					tagName: "a",
					type: "element",
				},
			];
		});
	};
};

export { codeCaptions, headingLinks };
