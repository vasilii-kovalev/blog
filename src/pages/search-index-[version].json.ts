import { type APIRoute, type GetStaticPaths } from "astro";

import { getSearchIndex } from "@/lib/search-index";

const getStaticPaths: GetStaticPaths = async () => {
	const { documents, version } = await getSearchIndex();

	return [
		{
			params: {
				version,
			},
			props: {
				documents,
			},
		},
	];
};

const GET: APIRoute = ({ props }) => {
	return Response.json(props.documents);
};

export { GET, getStaticPaths };
