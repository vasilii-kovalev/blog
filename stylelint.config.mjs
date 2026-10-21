/** @type {import("stylelint").Config} */
const config = {
	extends: ["stylelint-config-standard"],
	overrides: [
		{
			files: ["src/styles/normalize.css"],
			rules: {
				/*
					The file is vendored from normalize.css. Its vendor prefixes target the browsers it corrects,
					so the prefix rules stay off to keep the file as close to upstream as possible.
				*/
				"property-no-vendor-prefix": null,
				"selector-no-vendor-prefix": null,
				"value-no-vendor-prefix": null,
			},
		},
	],
	plugins: ["stylelint-order"],
	rules: {
		"order/custom-properties-alphabetical-order": true,
		"order/order": ["custom-properties", "declarations", "at-rules", "rules"],
		"order/properties-alphabetical-order": true,
		"selector-class-pattern":
			"^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*(?:__[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)?(?:--[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)?(?:\\[.+\\])?$",
	},
};

export default config;
