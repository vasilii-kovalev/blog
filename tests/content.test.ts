import assert from "node:assert/strict";
import { test } from "node:test";
import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import {
	formatPublicationDate,
	isPublicationDate,
	postUrl,
} from "../src/lib/posts.ts";
import { codeCaptions, headingLinks } from "../src/lib/markdown.ts";
import { extractSearchText, indexVersion } from "../src/lib/search.ts";
import { createSearch } from "../src/lib/search-client.ts";

test("publication dates preserve the calendar day and original formatting", () => {
	assert.equal(formatPublicationDate("2021-07-06"), "July 6, 2021");
	assert.equal(isPublicationDate("2024-02-29"), true);
	assert.equal(isPublicationDate("2021-02-29"), false);
	assert.equal(isPublicationDate("July 6, 2021"), false);
	assert.throws(() => {
		return formatPublicationDate("2021-02-29");
	}, /Invalid publication date/);
});

test("post paths preserve directory URLs and support both deployment bases", () => {
	assert.equal(
		postUrl("why-i-wrote-hydrate-text-library", "/blog/"),
		"/blog/posts/why-i-wrote-hydrate-text-library/",
	);
	assert.equal(postUrl("nested/example", "/"), "/posts/nested/example/");
	assert.equal(postUrl("with space", "/blog"), "/blog/posts/with%20space/");
});

test("search versions contain only UTC date and time to seconds", () => {
	assert.equal(
		indexVersion(new Date("2026-10-21T13:28:25.559+05:00")),
		"20261021T082825Z",
	);
});

test("plain-text extraction preserves headings, code, and decoded entities", () => {
	const result = extractSearchText(
		'<h2 id="example"><a href="#example">A &amp; B</a></h2><p>A <strong>test</strong>.</p><pre><code>const example = 1;</code></pre>',
	);
	assert.equal(result.headings, "A & B");
	assert.match(result.body, /A & B/);
	assert.match(result.body, /const example = 1;/);
	assert.doesNotMatch(result.body, /<strong>|href=|&amp;/);
});

test("search finds body text, tolerates typos, and boosts titles and headings", () => {
	const common = { description: "Example", url: "/posts/example/" };
	const search = createSearch([
		{
			...common,
			id: "title",
			title: "Temporal",
			headings: "Other",
			body: "Other",
		},
		{
			...common,
			id: "heading",
			title: "Other",
			headings: "Temporal",
			body: "Other",
		},
		{
			...common,
			id: "body",
			title: "Other",
			headings: "Other",
			body: "Temporal uniqueidentifier",
		},
	]);
	assert.deepEqual(
		search.search("temporal").map((result) => {
			return result.id;
		}),
		["title", "heading", "body"],
	);
	assert.equal(search.search("uniqueidentifier")[0].id, "body");
	assert.equal(search.search("temporel")[0].id, "title");
});

test("Markdown preserves code captions, literal template syntax, and old heading IDs", async () => {
	const processor = await createMarkdownProcessor({
		syntaxHighlight: false,
		smartypants: false,
		remarkPlugins: [codeCaptions],
		rehypePlugins: [headingLinks],
	});
	const { code } = await processor.render(
		'### hydrate‑text approach\n\n```json label="JSON" file="src/example.json"\n{"text":"{{minLength}}"}\n```',
	);
	assert.match(code, /id="hydrate%E2%80%91text-approach"/);
	assert.match(code, /class="header-anchor"/);
	assert.match(code, /class="code-block"/);
	assert.match(code, /src\/example.json/);
	assert.match(code, /\{\{minLength\}\}/);
});
