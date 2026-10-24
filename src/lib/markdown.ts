import { defineHastPlugin, defineMdastPlugin } from "satteri";

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

const codeCaptions = defineMdastPlugin({
	code: (node, context) => {
		const { file, label } = getCaptionParts(node.meta ?? "");

		if (label !== null) {
			context.replaceNode(node, [
				{
					raw: createCodeCaption(label, file),
				},
				node,
				{
					raw: "</figure>",
				},
			]);
		}
	},
	name: "code-captions",
});

const headingLinks = defineHastPlugin({
	element: {
		filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
		visit: (node) => {
			const { id } = node.properties;

			// The heading plugin runs first and assigns this.
			if (typeof id !== "string") {
				return node;
			}

			return {
				...node,
				children: [
					{
						children: node.children,
						properties: {
							className: ["header-anchor"],
							href: `#${id}`,
						},
						tagName: "a",
						type: "element",
					},
				],
				properties: {
					...node.properties,
					tabIndex: -1,
				},
			};
		},
	},
	name: "heading-links",
});

/*
	Available as `remarkPluginFrontmatter.searchText` from `render()`.
	Raw HTML, such as code captions, is not part of the text.
*/
const searchText = defineHastPlugin({
	after: (root, context) => {
		if (context.data.astro) {
			// The plugin stores the page text on the host context.
			// oxlint-disable-next-line eslint/no-param-reassign
			context.data.astro.frontmatter.searchText = context.textContent(root);
		}
	},
	name: "search-text",
});

export { codeCaptions, headingLinks, searchText };
