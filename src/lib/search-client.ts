import MiniSearch from "minisearch";

import { miniSearchOptions } from "./search";

// Returns the IDs of the matching posts, the most relevant first.
type Search = (query: string) => Array<string>;

interface SearchElements {
	count: HTMLElement;
	error: HTMLElement;
	input: HTMLInputElement;
	list: HTMLElement;
	loading: HTMLElement;
	results: HTMLElement;
	retry: HTMLElement;
}

const loadSearch = async (url: string): Promise<Search> => {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Search index request failed (${response.status}).`);
	}

	const miniSearch = MiniSearch.loadJSON(await response.text(), miniSearchOptions);

	return (query) => {
		const searchResults = miniSearch.search(query);

		return searchResults.map<string>((result) => {
			return String(result.id);
		});
	};
};

const getElement = <Type extends HTMLElement>(id: string, type: new () => Type): Type => {
	const element = document.getElementById(id);

	if (!(element instanceof type)) {
		throw new TypeError(`Missing search element: #${id}`);
	}

	return element;
};

const getSearchElements = (): SearchElements => {
	return {
		count: getElement("search-count", HTMLElement),
		error: getElement("search-error", HTMLElement),
		input: getElement("post-search", HTMLInputElement),
		list: getElement("search-list", HTMLElement),
		loading: getElement("search-loading", HTMLElement),
		results: getElement("search-results", HTMLElement),
		retry: getElement("search-retry", HTMLElement),
	};
};

const resultLabel = (count: number): string => {
	if (count === 1) {
		return "result";
	}

	return "results";
};

const findItems = (items: Array<HTMLElement>, ids: Array<string>): Array<HTMLElement> => {
	return ids.flatMap<HTMLElement>((id) => {
		return (
			items.find((item) => {
				return item.dataset.id === id;
			}) ?? []
		);
	});
};

// The search UI is updated by writing these elements.
/* oxlint-disable eslint/no-param-reassign */
const showResults = (elements: SearchElements, items: Array<HTMLElement>, search: Search | null): void => {
	const query = elements.input.value.trim();

	if (search === null || query === "") {
		elements.count.hidden = true;
		elements.list.replaceChildren(...items);

		return;
	}

	const matches = findItems(items, search(query));

	elements.count.hidden = false;
	elements.count.textContent = `${matches.length} ${resultLabel(matches.length)}`;
	elements.list.replaceChildren(...matches);
};
/* oxlint-enable eslint/no-param-reassign */

const initSearch = (): void => {
	const elements = getSearchElements();
	const items = [...elements.list.querySelectorAll("li")];
	let search: Search | null = null;

	const update = (): void => {
		showResults(elements, items, search);
	};
	const load = async (): Promise<void> => {
		elements.error.hidden = true;
		elements.loading.hidden = false;
		elements.results.ariaBusy = "true";

		try {
			search = await loadSearch(elements.input.dataset.indexUrl ?? "");
		} catch {
			elements.error.hidden = false;
		}

		elements.loading.hidden = true;
		elements.results.ariaBusy = "false";
		update();
	};

	elements.input.addEventListener("input", update);
	elements.retry.addEventListener("click", () => {
		void load();
	});

	void load();
};

export { initSearch };
