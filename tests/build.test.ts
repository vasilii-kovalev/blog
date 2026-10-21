import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { test } from "node:test";
import { fromHtml } from "hast-util-from-html";
import { visit } from "unist-util-visit";
import { createSearch } from "../src/lib/search-client.ts";
import type { SearchIndex } from "../src/lib/search.ts";

const output = new URL("../dist/", import.meta.url);
const home = readFileSync(new URL("index.html", output), "utf8");
const post = readFileSync(
	new URL("posts/why-i-wrote-hydrate-text-library/index.html", output),
	"utf8",
);

test("production keeps the original post path, date, captions, and metadata", () => {
	assert.match(
		home,
		/href="\/blog\/posts\/why-i-wrote-hydrate-text-library\/"/,
	);
	assert.match(post, /datetime="2021-07-06"[^>]*>\s*July 6, 2021/);
	assert.match(post, /name="description" content="A post about why I wrote/);
	assert.match(post, /id="hydrate%E2%80%91text-approach"/);
	assert.equal((post.match(/class="code-block"/g) ?? []).length, 28);
	assert.doesNotMatch(post, /\{%|astro-island|<script/);
	assert.match(
		post,
		/blob\/main\/src\/posts\/why-i-wrote-hydrate-text-library\.md/,
	);
});

test("production links resolve to published static assets", () => {
	for (const html of [home, post]) {
		visit(fromHtml(html), "element", (node) => {
			for (const attribute of ["src", "href"]) {
				const value = node.properties[attribute];
				if (typeof value !== "string" || !value.startsWith("/")) {
					continue;
				}
				assert.ok(value.startsWith("/blog/"), `Unprefixed URL: ${value}`);
				const path = value.slice("/blog/".length);
				assert.ok(
					existsSync(
						new URL(path.endsWith("/") ? `${path}index.html` : path, output),
					),
					`Missing static file: ${value}`,
				);
			}
		});
	}
});

test("home renders one post list with search between the Posts heading and list", () => {
	const tree = fromHtml(home);
	let lists = 0;
	let searchHeadings = 0;
	visit(tree, "element", (node) => {
		if (
			node.tagName === "a" &&
			node.properties.href === "/blog/posts/why-i-wrote-hydrate-text-library/"
		) {
			lists++;
		}
		if (node.tagName === "h2" && node.properties.id === "search-heading") {
			searchHeadings++;
		}
	});
	assert.equal(lists, 1);
	assert.equal(searchHeadings, 0);
	assert.ok(home.indexOf("Posts:</h2>") < home.indexOf('id="post-search"'));
	assert.ok(
		home.indexOf('id="post-search"') < home.indexOf('id="search-results"'),
	);
});

test("home preloads the versioned full-text index and the post has no search runtime", () => {
	const files = readdirSync(output).filter((file) => {
		return /^search-index-.*\.json$/.test(file);
	});
	assert.equal(files.length, 1);
	const index: SearchIndex = JSON.parse(
		readFileSync(new URL(files[0], output), "utf8"),
	);
	assert.match(index.version, /^\d{8}T\d{6}Z$/);
	assert.equal(files[0], `search-index-${index.version}.json`);
	assert.match(
		home,
		new RegExp(`rel="preload" href="/blog/${files[0]}" as="fetch"`),
	);
	assert.equal(index.documents.length, 1);
	assert.equal(
		index.documents[0].url,
		"/blog/posts/why-i-wrote-hydrate-text-library/",
	);
	assert.match(
		index.documents[0].headings,
		/Internationalization with i18next/,
	);
	assert.match(index.documents[0].body, /LanguageDetector/);
	assert.doesNotMatch(index.documents[0].body, /<figcaption|<h2|{% codeblock/);
	assert.equal(
		createSearch(index.documents).search("LanguageDetector").length,
		1,
	);
	assert.match(home, /astro-island/);
});
