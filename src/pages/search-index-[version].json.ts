import type { APIRoute, GetStaticPaths } from "astro";
import { getSearchIndex } from "../lib/search-index";

export const getStaticPaths: GetStaticPaths = async () => {
	const index = await getSearchIndex();

	return [{ params: { version: index.version }, props: { index } }];
};

export const GET: APIRoute = ({ props }) => {
	return new Response(JSON.stringify(props.index), {
		headers: { "Content-Type": "application/json; charset=utf-8" },
	});
};
