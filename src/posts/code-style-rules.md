---
title: Code style
description: My code style rules
layout: post.njk
published: ""
tags:
	- post
---

## Summary

This article describes my code style rules, which include both programming language-specific approaches to write code as well as code formatting preferences.

## Goals

1. Keep the code consistent to make it easier to read and change
2. Keep the rules simple to follow by humans and easy to configure in tools
3. Eliminate ambiguity and dependence on specific circumstances (where possible)
4. Simplify changes review in version control systems

## Rules

### Common

#### Comments

TBD.
Always multiline.
Above the commented code.
JSDoc where supported.
Start with capital letter.
Capital letter after TODO.

#### Indentation

TBD.
Tabs, if it doesn't break the code.

#### Items in brackets

Each item in brackets—parentheses/round brackets (`()`), square brackets (`[]`), braces/curly brackets (`{}`) and angle brackets (`<>`)—is placed on a new line.

##### Examples

{% codeblock "TypeScript" %}

```typescript
/**
 * Example 1.
 */
const getRandomNumber = (): number => {
	return Math.random();
};

/**
 * Example 2.
 */
const getRandomNumber = (
	min: number,
	max: number,
): number => {
	if (
		min > max
	) {
		throw new Error(
			`Min value ${
				min
			} is greater than max value ${
				max
			}.`,
		);
	}

	/**
	 * Example of multiple conditions.
	 */
	if (
		min < 0
		&& max < 0
	) {
		throw new Error(
			`Min value ${
				min
			} and max value ${
				max
			} should be greater than 0.`,
		);
	}

	return (
		(
			Math.random()
			* max
		)
		+ min
	);
};

interface GetRandomNumberParams {
	max: number;
	min: number;
}

/**
 * Example 3.
 */
const getRandomNumber = (
	params: GetRandomNumberParams,
): number => {
	if (
		params.min > params.max
	) {
		throw new Error(
			`Min value ${params.min} is greater than max value ${params.max}.`,
		);
	}

	return (
		(
			Math.random()
			* params.max
		)
		+ params.min,
	);
};

/**
 * Example 4.
 */
const getRandomNumber = (
	params: GetRandomNumberParams,
): number => {
	const {
		max,
		min,
	} = params;

	if (
		min > max
	) {
		throw new Error(
			`Min value ${
				min
			} is greater than max value ${
			 	max
			}.`,
		);
	}

	return (
		(
			Math.random()
			* max
		)
		+ min
	);
};

/**
 * Example 5.
 */
const getRandomNumber = (
	{
		max,
		min,
	}: GetRandomNumberParams,
): number => {
	if (
		min > max
	) {
		throw new Error(
			`Min value ${
				min
			} is greater than max value ${
			 	max
			}.`,
		);
	}

	return (
		(
			Math.random()
			* max
		)
		+ min
	);
};

/**
 * Example 6.
 */
const getRandomNumber = (
	params: Partial<
		GetRandomNumberParams
	> = {},
): number => {
	const {
		max = 1,
		min = 0,
	} = params;

	if (
		min > max
	) {
		throw new Error(
			`Min value ${
				min
			} is greater than max value ${
			 	max
			}.`,
		);
	}

	return (
		(
			Math.random()
			* max
		)
		+ min
	);
};

/**
 * Example 7.
 */
const getRandomNumber = (
	{
		max = 1,
		min = 0,
	}: Partial<
		GetRandomNumberParams
	> = {},
): number => {
	if (
		min > max
	) {
		throw new Error(
			`Min value ${
				min
			} is greater than max value ${
			 	max
			}.`,
		);
	}

	return (
		(
			Math.random()
			* max
		)
		+ min
	);
};

/**
 * Example 8.
 */
const getRandomInt = (
	{
		max = 1,
		min = 0,
	}: Partial<
		GetRandomNumberParams
	> = {},
): number => {
	if (
		min > max
	) {
		throw new Error(
			`Min value ${
				min
			} is greater than max value ${
			 	max
			}.`,
		);
	}

	return Math.round(
		(
			Math.random()
			* max
		)
		+ min,
	);
};

/**
 * Example 9.
 */
const randomNumber = getRandomNumber(
	0.5,
	1.5,
);

/**
 * Example 10.
 */
const randomInt = getRandomInt();

/**
 * Example 11.
 */
const randomInt = getRandomInt(
	{},
);

/**
 * Example 12.
 */
const randomInt = getRandomInt(
	{
		min: 0.5,
	},
);

/**
 * Example 13.
 */
const randomInt = getRandomInt(
	{
		max: 1.5,
	},
);

/**
 * Example 14.
 */
const randomInt = getRandomInt(
	{
		min: 0.5,
		max: 1.5,
	},
);

/**
 * Example 15.
 */
const shortVariable: Partial<
	GetRandomNumberParams
> = {
	min: 0.5,
	max: 1.5,
};

const randomInt = getRandomInt(
	shortVariable,
);

/**
 * Example 16.
 */
const veryLooooooooooooooooooooooooooooooooooooooooooooooooongVariable: Partial<
	GetRandomNumberParams
> = {
	min: 0.5,
	max: 1.5,
};

/**
 * "Specific circumstances" (long variable and function names) don't affect formatting.
 */
const randomInt = getRandoooooooooooooooooooooooooooooooooooooooooooooooooomInt(
	veryLooooooooooooooooooooooooooooooooooooooooooooooooongVariable,
);

type GetValueNext<
	Value = unknown,
> = (
	valueCurrent: Value,
) => Value;

type SetValue<
	Value = unknown,
> = (
	getValueNext: GetValueNext<
		Value
	>,
) => void;

type UseStateReturnType<
	Value = unknown,
> = [
	Value,
	SetValue<Value>,
];

/**
 * Example 17.
 */
const useState = <
	Value = unknown,
>(
	initialValue: Value,
): UseStateReturnType<
	Value
> => {
	let value: Value = initialValue;

	const setValue: SetValue<
		Value
	> = (
		getValueNext,
	) => {
		const valueNext = getValueNext(
			value,
		);

		value = valueNext;
	};

	return [
		value,
		setValue,
	];
};

/**
 * Example 18.
 */
const stateGetterAndSetter = useState(
	0,
);

interface State {
	count: number;
}

/**
 * Example 19.
 */
const stateGetterAndSetter = useState<
	State,
>(
	{
		count: 0,
	},
);

/**
 * Example 20.
 */
const [
	state,
	setState,
] = useState<
	State,
>(
	{
		count: 0,
	},
);

/**
 * Example 21.
 */
const [
	state,
] = useState<
	State,
>(
	{
		count: 0,
	},
);

/**
 * Example 22.
 */
const [
	,
	setState,
] = useState<
	State,
>(
	{
		count: 0,
	},
);

/**
 * Example 23.
 */
setState(
	(
		{
			count,
		},
	) => {
		return {
			count: count + 1,
		};
	},
);

/**
 * Example 24.
 */
import {
	type FC,
} from "react";

/**
 * Example 25.
 */
import {
	type FC,
	useState,
} from "react";

/**
 * Example 26.
 */
export {
	type FC,
	getRandomInt,
	getRandomNumber,
};
```

{% endcodeblock %}

{% codeblock "CSS" %}

```css
/*
	Example 1.
*/
:root {
	--color-dark: #202124;
	--color-light: white;
	--border-radius: 2px;
	--text-color: var(
		--color-dark
	);
	--background-color: var(
		--color-light
	);
}

/*
	Example 2.
*/
@media (
	prefers-color-scheme: dark
) {
	:root {
		--text-color: var(
			--color-light
		);
		--background-color: var(
			--color-dark
		);
	}
}

/*
	Example 3.
*/
a:is(
	:hover,
	:focus
) code:not(
	[class*="language"]
) {
	border-color: transparent;
}
```

{% endcodeblock %}

#### Items sorting

Items are sorted alphabetically (case-insensitive) when order doesn't change behavior.

##### Examples

{% codeblock "TypeScript" %}

```typescript
/**
 * Example 1.
 */
interface User {
	email: string;
	fullName: string;
	id: string;
	isAdmin: boolean;
	permissions: Array<string>;
}

const user: User = {
	email: "John_Doe@site.com",
	fullName: "John Doe",
	id: "123",
	isAdmin: true,
	permissions: [
		"CAN_CREATE_USERS",
		"CAN_DELETE_USERS",
		"CAN_EDIT_USERS",
		"CAN_READ_USERS",
	],
};

/**
 * Example 2.
 */
const getAdminUser = (
	override: Partial<User> = {},
): User => {
	const {
		permissions = [],
	} = override;

	return {
		email: "John_Doe@site.com",
		fullName: "John Doe",
		id: "123",
		...override,
		/**
		 * `isAdmin` and `permissions` should take precedence over `override` destructuring, so they are placed after it,
		 * creating a new sorting block.
		 */
		isAdmin: true,
		permissions: [
			...permissions,
			"CAN_CREATE_USERS",
			"CAN_DELETE_USERS",
			"CAN_EDIT_USERS",
			"CAN_READ_USERS",
		],
	};
};

/**
 * Example 3.
 */
import {
	lazy,
	/**
	 * `type` keyword doesn't affect the sorting.
	 */
	type SetStateAction,
	Suspense,
} from "react";

/**
 * Example 4.
 */
export {
	type FC,
	lazy,
	Suspense,
};
```

{% endcodeblock %}

{% codeblock "HTML" %}

```html
<!--
	Example 1.
-->
<img
	alt="Favicon from Example site"
	class="my-class"
	height="10"
	src="https://example.com/favicon.png"
	width="10"
>
```

{% endcodeblock %}

{% codeblock "CSS" %}

```css
/*
	Example 1.
*/
.my-class {
	display: flex;
	flex-direction: column;
	font-size: 12px;
	gap: 10px 12px;
	justify-content: space-between;
	margin: 10px;
	margin-block-end: 12px;
}
```

{% endcodeblock %}

#### Naming

TBD.
[Naming cheatsheet](https://github.com/kettanaito/naming-cheatsheet) with do/does.

#### Project structure

TBD.
Folder names. Files in thematic folders (like `components`) are located plainly, without sub-folders. Where to put tests - plainly or in `tests` directory (latter, probably).

#### Trailing comma

TBD.
Always, if it doesn't break the code.

#### Quotes

TBD.
Double with character escaping, unless there are better alternatives (template literals, for example).

### Javascript/Typescript

#### Array type

TBD.
Use `Array<Item>` instead of `Item[]`.

#### Conditions

TBD.
Use early returns. Only booleans.

#### Destructuring

TBD.
Apply destructuring to all objects except function parameters.

#### Ending semicolon

TBD.
Always.

#### Error handling

TBD.
Handler the error in actions (high level trigger handlers) instead of close to the source of issues.

#### Function parentheses

TBD.
Always.

#### Function signature

TBD.
Input and output are explicitly typed rather than inferred. Standalone types for parameters and return type. Use generics where available (`.map<Item>()`, for example).
Describe how to type sub-functions in a function:

```typescript
/**
 * Option 1.
 */
interface Function1Params {
	isAdmin: boolean;
}

interface FunctionsReturnType {
	function1: (
		params: Function1Params,
	) => void;
}

const useFunctions = (): FunctionsReturnType => {
	const function1: FunctionsReturnType["function1"] = (
		params,
	) => {
		return undefined;
	};

	return {
		function1,
	};
};

/**
 * Option 2.
 */
interface Function1Params {
	isAdmin: boolean;
}

type Function1 = (
	params: Function1Params,
) => void;

interface FunctionsReturnType {
	function1: Function1;
}

const useFunctions = (): FunctionsReturnType => {
	const function1: Function1 = (
		params,
	) => {
		return undefined;
	};

	return {
		function1,
	};
};
```

#### Function type

TBD.
Arrow function (function expression). `function` where necessary.
I could use `function`, but defining a type for the whole function is too useful to drop.

#### Import and export

TBD.
Named exports, except when required.
All exports at the bottom.
All absolute imports, except in the same folder.

#### Naming

TBD.

#### Operators placement

TBD.
In front of the 2nd+ statement.

#### Parameters count

TBD.
1 -> as is. 2 -> object, but consider using object all the time.

#### Value mapping

TBD.
Switch-case instead of an object.

#### Variables

TBD.
Constants. `let` where necessary.

### TypeScript-specific

#### Constants map

TBD.
Enums, but actually consider `as const`.

#### Type definition

TBD.
Interface, sometimes `type` where necessary.
`type` can't use `extends`.
Also, define array type definition preference.
Also, define functions in interfaces declaration style (add a reference to the article describing differences of the styles).

### JSX

#### Attributes placement

TBD.
Each item is placed on a new line.
