const isPublicationDate = (value: string): boolean => {
	if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) {
		return false;
	}

	const date = new Date(`${value}T00:00:00Z`);

	return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(value);
};

const formatPublicationDate = (value: string): string => {
	if (!isPublicationDate(value)) {
		throw new Error(`Invalid publication date: ${value}`);
	}

	return new Date(`${value}T00:00:00Z`).toLocaleString("en", {
		day: "numeric",
		month: "long",
		timeZone: "UTC",
		year: "numeric",
	});
};

const postUrl = (id: string, base: string): string => {
	return `${base.replace(/\/?$/u, "/")}posts/${id.split("/").map(encodeURIComponent).join("/")}/`;
};

export { formatPublicationDate, isPublicationDate, postUrl };
