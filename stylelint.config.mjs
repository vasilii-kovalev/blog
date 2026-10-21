/** @type {import("stylelint").Config} */
const config = {
	extends: ["stylelint-config-standard"],
	ignoreFiles: ["src/styles/normalize.css"],
	plugins: ["stylelint-order"],
	rules: {
		"font-family-no-duplicate-names": [
			true,
			{
				ignoreFontFamilyNames: ["monospace"],
			},
		],
		"order/custom-properties-alphabetical-order": true,
		"order/order": ["custom-properties", "declarations", "at-rules", "rules"],
		"order/properties-alphabetical-order": true,
		"selector-class-pattern":
			"^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*(?:__[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)?(?:--[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)?(?:\\[.+\\])?$",
	},
};

export default config;
