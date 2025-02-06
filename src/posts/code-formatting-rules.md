---
title: Code formatting rules
description: My code formatting rules
layout: post.njk
published: ""
tags:
	- post
---

## Goals of the formatting rules

1. Keep the code consistent to make it easier to read and change
2. Keep them simple to follow by humans and easy to configure in tools
3. Eliminate ambiguity and dependence on specific circumstances
4. Simplify changes review in version control systems

## Rules

### Common

#### Parentheses

Each item in brackets—parentheses/round brackets (`()`), square brackets (`[]`), braces/curly brackets (`{}`) and angle brackets (`<>`)—is placed on a new line.

##### Examples

{% codeblock "TypeScript" %}

```typescript
// Example 1.
const getRandomNumber = (): number => {
	return Math.random();
};

// Example 2.
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

	// Example of multiple conditions.
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

// Example 3.
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

// Example 4.
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

// Example 5.
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

// Example 6.
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

// Example 7.
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

// Example 8.
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

// Example 9.
const randomNumber = getRandomNumber(
	0.5,
	1.5,
);

// Example 10.
const randomInt = getRandomInt();

// Example 11.
const randomInt = getRandomInt(
	{},
);

// Example 12.
const randomInt = getRandomInt(
	{
		min: 0.5,
	},
);

// Example 13.
const randomInt = getRandomInt(
	{
		max: 1.5,
	},
);

// Example 14.
const randomInt = getRandomInt(
	{
		min: 0.5,
		max: 1.5,
	},
);

// Example 15.
const shortVariable: Partial<
	GetRandomNumberParams
> = {
	min: 0.5,
	max: 1.5,
};

const randomInt = getRandomInt(
	shortVariable,
);

// Example 16.
const veryLooooooooooooooooooooooooooooooooooooooooooooooooongVariable: Partial<
	GetRandomNumberParams
> = {
	min: 0.5,
	max: 1.5,
};

// "Specific circumstances" (long variable and function names) don't affect formatting.
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

// Example 17.
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

// Example 18.
const stateGetterAndSetter = useState(
	0,
);

interface State {
	count: number;
}

// Example 19.
const stateGetterAndSetter = useState<
	State,
>(
	{
		count: 0,
	},
);

// Example 20.
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

// Example 21.
const [
	state,
] = useState<
	State,
>(
	{
		count: 0,
	},
);

// Example 22.
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

// Example 23.
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

// Example 24.
import {
	type FC,
} from "react";

// Example 25.
import {
	type FC,
	useState,
} from "react";

// Example 26.
export {
	type FC,
	getRandomInt,
	getRandomNumber,
};
```

{% endcodeblock %}
