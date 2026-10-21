import assert from "node:assert/strict";
import { test } from "node:test";
import { postSchema } from "../src/lib/post-schema.ts";

const post = {
	title: "Example",
	description: "An example post",
	published: "2021-07-06",
	tags: ["post"],
};

test("post schema preserves valid metadata, including date-only strings", () => {
	assert.deepEqual(postSchema.parse(post), post);
});

test("post schema requires every current metadata field", () => {
	for (const key of Object.keys(post)) {
		const incomplete: Record<string, unknown> = { ...post };
		delete incomplete[key];
		const result = postSchema.safeParse(incomplete);
		assert.equal(result.success, false, `Accepted missing ${key}`);
		if (!result.success) {
			assert.equal(result.error.issues[0].path[0], key);
		}
	}
});

test("post schema rejects empty titles, invalid dates, and non-string tags", () => {
	for (const invalid of [
		{ title: "" },
		{ description: "" },
		{ published: "2021-02-29" },
		{ published: new Date("2021-07-06") },
		{ tags: [1] },
	]) {
		assert.equal(postSchema.safeParse({ ...post, ...invalid }).success, false);
	}
});
