const config = {
	plugins: ["stylelint-order"],
	extends: ["stylelint-config-standard", "stylelint-config-prettier"],
	rules: {
		"at-rule-no-unknown": null,
		"font-family-no-duplicate-names": [
			true,
			{
				ignoreFontFamilyNames: ["monospace"],
			},
		],
		// BEM
		"selector-class-pattern":
			"^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*(?:__[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)?(?:--[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)?(?:\\[.+\\])?$",

		"order/properties-alphabetical-order": true,
	},
};

module.exports = config;
