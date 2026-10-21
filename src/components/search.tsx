import {
	createMemo,
	createResource,
	createSignal,
	For,
	onMount,
	Show,
} from "solid-js";
import { createSearch } from "../lib/search-client";
import type { SearchIndex } from "../lib/search-client";
import "../styles/search.css";

interface PostSummary {
	url: string;
	title: string;
	description: string;
}

export default function Search(props: {
	indexUrl: string;
	posts: PostSummary[];
}) {
	const [query, setQuery] = createSignal("");
	const [attempt, setAttempt] = createSignal(0);
	const [mounted, setMounted] = createSignal(false);

	onMount(() => {
		setMounted(true);
	});

	const [search] = createResource(
		() => {
			return mounted() ? attempt() : false;
		},
		async () => {
			const response = await fetch(props.indexUrl);

			if (!response.ok) {
				throw new Error(`Search index request failed (${response.status}).`);
			}

			const index: SearchIndex = await response.json();

			return createSearch(index.documents);
		},
	);

	const results = createMemo(() => {
		if (!query().trim() || search.loading || search.error) {
			return props.posts;
		}

		const engine = search();

		return engine ? engine.search(query().trim()) : props.posts;
	});

	return (
		<div class="search">
			<input
				id="post-search"
				type="search"
				aria-label="Search posts"
				placeholder="Search posts"
				value={query()}
				onInput={(event) => {
					setQuery(event.currentTarget.value);
				}}
				aria-controls="search-results"
			/>
			<Show when={search.loading}>
				<p role="status">Loading search…</p>
			</Show>
			<Show when={search.error}>
				<p role="alert">
					Search could not be loaded. You can still use the post list below.{" "}
					<button
						type="button"
						onClick={() => {
							setAttempt(attempt() + 1);
						}}
					>
						Retry
					</button>
				</p>
			</Show>
			<div id="search-results" aria-busy={search.loading}>
				<Show when={query().trim() && !search.loading && !search.error}>
					<p role="status">
						{results().length} {results().length === 1 ? "result" : "results"}
					</p>
				</Show>
				<ul>
					<For each={results()}>
						{(result) => {
							return (
								<li>
									<a href={result.url}>{result.title}</a>
									<p>{result.description}</p>
								</li>
							);
						}}
					</For>
				</ul>
			</div>
		</div>
	);
}
