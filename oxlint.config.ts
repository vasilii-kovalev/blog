import { defineConfig } from "oxlint";

const config = defineConfig({
	categories: {
		correctness: "error",
		pedantic: "error",
		perf: "error",
		restriction: "error",
		style: "error",
		suspicious: "error",
	},
	options: {
		typeAware: true,
		// Report TypeScript errors alongside lint diagnostics.
		typeCheck: true,
	},
	overrides: [
		{
			// Astro and the tool configs are loaded through a default export.
			files: ["**/*.config.mjs", "**/*.config.ts"],
			rules: {
				"import/no-default-export": "off",
			},
		},
		{
			files: ["**/*.astro"],
			rules: {
				// Astro frontmatter is a module even when it has no imports or exports.
				"import/unambiguous": "off",
			},
		},
		{
			// This file is the list of lint decisions, so its length is that list.
			files: ["oxlint.config.ts"],
			rules: {
				"eslint/max-lines": "off",
			},
		},
	],
	plugins: ["typescript", "import"],
	rules: {
		// Every arrow has a block body, so a short function has the same shape as a longer one.
		"eslint/arrow-body-style": ["error", "always"],
		// A function is an expression, including an arrow, so every function has one form.
		"eslint/func-style": [
			"error",
			"expression",
			{
				allowArrowFunctions: true,
			},
		],
		/*
			A function uses a block body and one step per line,
			so one component or one update is longer than the default of 50.
		*/
		"eslint/max-lines-per-function": [
			"error",
			{
				max: 100,
			},
		],
		/*
			Separate statements make one operation cost several of them.
			The default of 10 is spent before that operation is finished.
		*/
		"eslint/max-statements": [
			"error",
			{
				max: 25,
			},
		],
		// A caught failure is reported with `console.error`. Any other console method is a debugging leftover.
		"eslint/no-console": [
			"error",
			{
				allow: ["error"],
			},
		],
		/*
			`continue` is the loop form of an early return.
			The rest of the iteration stays flat instead of nesting under the condition.
		*/
		"eslint/no-continue": "off",
		"eslint/no-magic-numbers": [
			"error",
			{
				// These values are too common for a disable comment at every use.
				ignore: [-1, 0, 1],
			},
		],
		// A parameter's properties stay as the caller passed them. Writing them is the same surprise as reassigning the binding.
		"eslint/no-param-reassign": [
			"error",
			{
				props: true,
			},
		],
		// A ternary is the expression form of a value choice. An if statement would split that choice across assignments.
		"eslint/no-ternary": "off",
		/*
			`undefined` is the absent value. A module cannot overwrite it,
			and `void 0` would be a second name for the same value.
		*/
		"eslint/no-undefined": "off",
		// A leading `_` marks a binding kept for its position, so the unused name is intentional.
		"eslint/no-unused-vars": [
			"error",
			{
				argsIgnorePattern: "^_",
				caughtErrorsIgnorePattern: "^_",
				destructuredArrayIgnorePattern: "^_",
				varsIgnorePattern: "^_",
			},
		],
		// Statement form is the explicit ignore for a floating promise.
		"eslint/no-void": [
			"error",
			{
				allowAsStatement: true,
			},
		],
		// Separated declarations are easier to comment out or move.
		"eslint/one-var": "off",
		/*
			Names inside an import use one case-insensitive order, so the list is easy to scan and a stray name stands out.
			Oxfmt orders the import statements. This rule orders the names inside each import.
		*/
		"eslint/sort-imports": [
			"error",
			{
				ignoreCase: true,
				ignoreDeclarationSort: true,
			},
		],
		// `type` is placed on the name. Every imported or exported symbol uses that same marking.
		"import/consistent-type-specifier-style": ["error", "prefer-inline"],
		// Symbols are imported from the module that defines them, so a count of imports is not a useful limit.
		"import/max-dependencies": "off",
		// A named export keeps the same symbol name at the import and the export.
		"import/no-named-export": "off",
		// A stylesheet import exists for its side effect, so there is no binding to assign.
		"import/no-unassigned-import": [
			"error",
			{
				allow: ["**/*.css"],
			},
		],
		// One export stays named, the same choice as `import/no-named-export`.
		"import/prefer-default-export": "off",
		// To make the syntax consistent with other generics.
		"typescript/array-type": [
			"error",
			{
				default: "generic",
			},
		],
		// An exported type keeps the inline `type` required by `import/consistent-type-specifier-style`.
		"typescript/consistent-type-exports": [
			"error",
			{
				fixMixedExportsWithInlineTypeSpecifier: true,
			},
		],
		// An imported type keeps the inline `type` required by `import/consistent-type-specifier-style`.
		"typescript/consistent-type-imports": [
			"error",
			{
				fixStyle: "inline-type-imports",
			},
		],
		// A type-only name keeps that same inline `type`. The marking does not change with the other symbols.
		"typescript/no-import-type-side-effects": "off",
		// The extra annotations are noise relative to the bugs this rule would catch here.
		"typescript/prefer-readonly-parameter-types": "off",
	},
});

export default config;
