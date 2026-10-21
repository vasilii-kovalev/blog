import { type APIRoute, type GetStaticPaths } from "astro";

import { getSearchIndex } from "@/lib/search-index";

interface Props {
	json: string;
}

const getStaticPaths: GetStaticPaths = async () => {
	const { json, version } = await getSearchIndex();

	return [
		{
			params: {
				version,
			},
			props: {
				json,
			} satisfies Props,
		},
	];
};

const GET: APIRoute<Props> = ({ props }) => {
	return new Response(props.json, {
		headers: {
			"Content-Type": "application/json; charset=utf-8",
		},
	});
};

export { GET, getStaticPaths };
