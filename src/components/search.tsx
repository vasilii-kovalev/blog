import {
	type Accessor,
	createMemo,
	createResource,
	createSignal,
	For,
	type JSX,
	onMount,
	type Resource,
	Show,
} from "solid-js";

import { createSearch, parseSearchIndex, type SearchEngine } from "@/lib/search-client";
import "@/styles/search.css";

interface UseSearchParams {
	search: Resource<SearchEngine>;
	retry: () => void;
}

const useSearch = (indexUrl: Accessor<string>): UseSearchParams => {
	const [attempt, setAttempt] = createSignal(0);
	const [mounted, setMounted] = createSignal(false);

	onMount(() => {
		setMounted(true);
	});

	const [search] = createResource(
		() => {
			if (mounted()) {
				return attempt();
			}

			return false;
		},
		async () => {
			const response = await fetch(indexUrl());

			if (!response.ok) {
				throw new Error(`Search index request failed (${response.status}).`);
			}

			const value: unknown = await response.json();
			const index = parseSearchIndex(value);

			return createSearch(index.documents);
		},
	);

	return {
		retry: () => {
			setAttempt(attempt() + 1);
		},
		search,
	};
};

const resultLabel = (count: number): string => {
	if (count === 1) {
		return "result";
	}

	return "results";
};

interface PostSummary {
	url: string;
	title: string;
	description: string;
}

interface SearchProps {
	posts: Array<PostSummary>;
	search: Resource<SearchEngine>;
	query: string;
}

const SearchResults = (props: SearchProps): JSX.Element => {
	const results = createMemo(() => {
		if (props.query.trim() === "" || props.search.loading || props.search.state === "errored") {
			return props.posts;
		}

		const engine = props.search();

		if (engine) {
			return engine.search(props.query.trim());
		}
		return props.posts;
	});

	return (
		<div id="search-results" aria-busy={props.search.loading}>
			<Show when={props.query.trim() !== "" && !props.search.loading && props.search.state !== "errored"}>
				<p role="status">
					{results().length} {resultLabel(results().length)}
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
	);
};

const SearchStatus = (props: { search: Resource<SearchEngine>; retry: () => void }): JSX.Element => {
	return (
		<>
			<Show when={props.search.loading}>
				<p role="status">Loading search…</p>
			</Show>
			<Show when={props.search.state === "errored"}>
				<p role="alert">
					Search could not be loaded. You can still use the post list below.{" "}
					<button type="button" onClick={props.retry}>
						Retry
					</button>
				</p>
			</Show>
		</>
	);
};

const Search = (props: { indexUrl: string; posts: Array<PostSummary> }): JSX.Element => {
	const [query, setQuery] = createSignal("");
	const { search, retry } = useSearch(() => {
		return props.indexUrl;
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
			<SearchStatus search={search} retry={retry} />
			<SearchResults search={search} query={query()} posts={props.posts} />
		</div>
	);
};

export { Search };
