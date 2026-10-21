import { type APIRoute, type GetStaticPaths } from "astro";

import { getSearchIndex } from "@/lib/search-index";

const getStaticPaths: GetStaticPaths = async () => {
	const index = await getSearchIndex();

	return [
		{
			params: {
				version: index.version,
			},
			props: {
				index,
			},
		},
	];
};

const GET: APIRoute = ({ props }) => {
	return new Response(JSON.stringify(props.index), {
		headers: {
			"Content-Type": "application/json; charset=utf-8",
		},
	});
};

export { GET, getStaticPaths };
