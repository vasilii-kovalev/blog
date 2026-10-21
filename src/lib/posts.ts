const formatPublicationDate = (value: string): string => {
	return new Date(value).toLocaleDateString("en", {
		dateStyle: "long",
		timeZone: "UTC",
	});
};

const postUrl = (id: string): string => {
	return `${import.meta.env.BASE_URL}posts/${id}/`;
};

export { formatPublicationDate, postUrl };
