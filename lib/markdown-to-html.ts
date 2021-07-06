import fs from "fs";
import path from "path";
import matter from "gray-matter";
import remark from "remark";
// @ts-expect-error: no types
import headings from "remark-autolink-headings";
import html from "remark-html";
// @ts-expect-error: no types
import slug from "remark-slug";

const TOPICS_MAP = {
  technologies: "technologies",
  reasoning: "reasoning",
} as const;

type Keys<Type> = keyof Type;

type Values<Type> = Type[Keys<Type>];

type Topic = Values<typeof TOPICS_MAP>;

interface Metadata {
  topics: Topic[];
  published: string;
}

const postsDirectory = path.join(process.cwd(), "markdown");

const markdownToHtml = (postId: string): void => {
  const fullPath = path.join(postsDirectory, `${postId}.md`);

  const postContent = fs.readFileSync(fullPath, "utf8");

  const post = matter(postContent);

  const { content, data: metadata } = post;

  const { topics, published } = metadata as Metadata;

  const result = remark()
    .use(slug)
    .use(html)
    .use(headings, { behavior: "wrap" })
    .processSync(content)
    .toString();

  fs.writeFileSync(
    path.join(postsDirectory, `${postId}-draft.html`),
    result,
    "utf8",
  );
};

markdownToHtml("why-i-wrote-hydrate-text-library");

export { markdownToHtml };
