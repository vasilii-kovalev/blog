export function isPublicationDate(value: string): boolean {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return false;
	}

	const date = new Date(`${value}T00:00:00Z`);

	return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(value);
}

export function formatPublicationDate(value: string): string {
	if (!isPublicationDate(value)) {
		throw new Error(`Invalid publication date: ${value}`);
	}

	return new Date(`${value}T00:00:00Z`).toLocaleString("en", {
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: "UTC",
	});
}

export function postUrl(id: string, base: string): string {
	return `${base.replace(/\/?$/, "/")}posts/${id
		.split("/")
		.map(encodeURIComponent)
		.join("/")}/`;
}
