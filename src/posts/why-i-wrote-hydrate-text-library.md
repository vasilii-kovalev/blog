---
title: Why I wrote "hydrate‑text" library
description: A post about why I wrote "hydrate‑text" library
published: "2021-07-06"
tags:
  - post
---

## Internationalization with i18next

On one of my projects at work, we used [i18next](https://www.i18next.com/) library (along with [react-i18next](https://react.i18next.com/)) to manage internationalization in a React application. To implement it, it is usually necessary to do this:

- Define an `i18next` instance

  ```javascript label="JavaScript" file="src/i18n/index.js"
  import i18n from "i18next";
  import { initReactI18next } from "react-i18next";
  import LanguageDetector from "i18next-browser-languagedetector";

  import {
  	en,
  	ru,
  	// ... other locales
  } from "./locales";

  const resources = {
  	en,
  	ru,
  	// ... other locales
  };

  i18n
  	.use(LanguageDetector)
  	.use(initReactI18next)
  	.init({
  		detection: {
  			lookupQuerystring: "lng",
  			order: ["querystring"],
  		},

  		fallbackLng: "en",
  		interpolation: {
  			// Not needed for React
  			escapeValue: false,
  		},
  		resources,
  	});

  export default i18n;
  ```

- Define the resources

  ```javascript label="JavaScript" file="src/i18n/locales/index.js"
  export { en } from "./en";
  export { ru } from "./ru";
  // ... other locales
  ```

  ```javascript label="JavaScript" file="src/i18n/locales/en/index.js"
  import errors from "./errors.json";
  // ... other namespaces

  const en = {
  	errors,
  	// ... other namespaces
  };

  export { en };
  ```

  ```json label="JSON" file="src/i18n/locales/en/errors.json"
  {
  	"validation": {
  		"field": {
  			"is": {
  				"empty": "This field is required",
  				"incorrect": {
  					"password": "Password is incorrect"
  				},
  				"invalid": {
  					"common": "Please enter a valid value",
  					"email": "Please enter a valid email address"
  				}
  			},
  			"length": {
  				"lessThan": "This field should contain at least {{minLength}} characters",
  				"moreThan": "This field should contain no more than {{maxLength}} characters"
  			}
  		},
  		"fields": {
  			"are": {
  				"not": {
  					"equal": {
  						"password": "Passwords don't match"
  					}
  				}
  			}
  		}
  	}
  }
  ```

  ```javascript label="JavaScript" file="src/i18n/locales/ru/index.js"
  import errors from "./errors.json";
  // ... other namespaces

  const ru = {
  	errors,
  	// ... other namespaces
  };

  export { ru };
  ```

  ```json label="JSON" file="src/i18n/locales/ru/errors.json"
  {
  	"validation": {
  		"field": {
  			"is": {
  				"empty": "Это поле является обязательным для заполнения",
  				"incorrect": {
  					"password": "Неверный пароль"
  				},
  				"invalid": {
  					"common": "Пожалуйста, введите корректное значение",
  					"email": "Пожалуйста, введите корректный адрес электронной почты"
  				}
  			},
  			"length": {
  				"lessThan": "Это поле должно состоять минимум из {{minLength}} символов",
  				"moreThan": "Это поле должно состоять максимум из {{maxLength}} символов"
  			}
  		},
  		"fields": {
  			"are": {
  				"not": {
  					"equal": {
  						"password": "Пароли не совпадают"
  					}
  				}
  			}
  		}
  	}
  }
  ```

- Import the `i18n` instance

  ```javascript label="JavaScript" file="src/main.jsx"
  import * as React from "react";
  import ReactDOM from "react-dom";

  import "./i18n";
  import { App } from "./app";

  ReactDOM.render(
  	<React.StrictMode>
  		<App />
  	</React.StrictMode>,
  	document.getElementById("root"),
  );
  ```

- Pass the translation function to a component via special HOC/React Hook

  ```javascript label="JavaScript" file="src/components/app.jsx"
  import * as React from "react";
  // The HOC
  import { withTranslation } from "react-i18next";

  const App = ({ t }) => {
  	/*
  		"This field should contain at least 10 characters" for English.
  		"Это поле должно состоять минимум из 10 символов" for Russian.
  	*/
  	const translatedText = t("errors:validation.field.length.lessThan", {
  		minLength: 10,
  	});

  	return <h1>{translatedText}</h1>;
  };

  const AppWithTranslation = withTranslation()(App);

  export { AppWithTranslation as App };
  ```

  Or

  ```javascript label="JavaScript" file="src/components/app.jsx"
  import * as React from "react";
  // The React Hook
  import { useTranslation } from "react-i18next";

  const App = () => {
  	const { t } = useTranslation();

  	/*
  		"This field should contain at least 10 characters" for English.
  		"Это поле должно состоять минимум из 10 символов" for Russian.
  	*/
  	const translatedText = t("errors:validation.field.length.lessThan", {
  		minLength: 10,
  	});

  	return <h1>{translatedText}</h1>;
  };

  export { App };
  ```

Either way, the component gets the `t` function. The function accepts a path to a localization string (see JSON files above), and an object with variables, which are put in the slots (defined in double curly braces) in the string.

[Link to full source code](https://github.com/vasilii-kovalev/react-internationalization-i18next).

## The problems

The whole approach looks reasonable, but there are some problems with it:

- Path to a localization string is a plain string, so it is easy to make typos. It is also easy to forget to define a namespace or make typos in it as well. It is necessary to thoroughly check each part of the path to make sure it leads to a correct localization string.
- The packages are heavy: the described approach in total takes ~55.1&nbsp;KiB, ~51&nbsp;KiB of which is the packages' code. Check out "Measuring application sizes" section below for more information.
- It is hard to keep the files' structure synchronized between locales. A sub-tree can be missed in a resource, and nothing will tell about that until [missing keys](https://www.i18next.com/overview/configuration-options#missing-keys) feature will handle it (if enabled).

We wrote that application using JavaScript back then. After several years I learned TypeScript and realized, how to solve all these problems.

## The solution

I like the API of the `t` function (path to a localization string and a bunch of variables to "hydrate" it), so I decided to copy it in a standalone package, that is known as ["hydrate‑text"](https://github.com/vasilii-kovalev/hydrate-text). Now let's implement our own i18n solution with it.

- Define supported languages and a default one

  ```typescript label="TypeScript" file="src/i18n/constants.ts"
  const SUPPORTED_LANGUAGES_MAP = {
  	en: "en",
  	ru: "ru",
  	// ... other languages
  } as const;

  const DEFAULT_SELECTED_LANGUAGE = SUPPORTED_LANGUAGES_MAP.en;

  export { DEFAULT_SELECTED_LANGUAGE, SUPPORTED_LANGUAGES_MAP };
  ```

- Define a "dictionary" (a structure, that will be used to type checking our localization resources)

  ```typescript label="TypeScript" file="src/i18n/dictionary/index.ts"
  import { errors } from "./errors";
  // ... other namespaces

  const dictionary = {
  	errors,
  	// ... other namespaces
  } as const;

  export { dictionary };
  ```

  ```typescript label="TypeScript" file="src/i18n/dictionary/errors.ts"
  const errors = {
  	validation: {
  		field: {
  			is: {
  				empty: "errors.validation.field.is.empty",
  				incorrect: {
  					password: "errors.validation.field.is.incorrect.password",
  				},
  				invalid: {
  					common: "errors.validation.field.is.invalid.common",
  					email: "errors.validation.field.is.invalid.email",
  				},
  			},
  			length: {
  				lessThan: "errors.validation.field.length.lessThan",
  				moreThan: "errors.validation.field.length.moreThan",
  			},
  		},
  		fields: {
  			are: {
  				not: {
  					equal: {
  						password: "errors.validation.fields.are.not.equal.password",
  					},
  				},
  			},
  		},
  	},
  } as const;

  export { errors };
  ```

  `as const` expressions require all the resources to strictly follow the structure.

  **Note:** it can be hard to fill in these strings manually, so I just assign empty strings to them and pass the whole structure to this function below.

  ```javascript label="JavaScript"
  const fillTreePaths = (treeWithEmptyPaths, namespace = "") => {
  	const traverse = (currentTree, parentPath) =>
  		Object.entries(currentTree).reduce((updatedCurrentTree, [key, value]) => {
  			const currentPath = `${parentPath}.${key}`;

  			if (typeof value === "string") {
  				return {
  					...updatedCurrentTree,
  					[key]: currentPath,
  				};
  			}

  			return {
  				...updatedCurrentTree,
  				[key]: traverse(value, currentPath),
  			};
  		}, {});

  	const newTree = traverse(treeWithEmptyPaths, namespace);

  	const stringifiedTree = JSON.stringify(newTree, null, 2);
  	const refinedTree = stringifiedTree
  		// Removes double quote before keys.
  		.replace(/(\s{2,})"/g, "$1")
  		// Removes double quote right after keys and before colons.
  		.replace(/"(: )/g, "$1");

  	return refinedTree;
  };

  /*
  Returns
  {
  	validation: {
  		field: {
  			is: {
  				empty: "errors.validation.field.is.empty",
  				incorrect: {
  					password: "errors.validation.field.is.incorrect.password",
  				},
  				invalid: {
  					common: "errors.validation.field.is.invalid.common",
  					email: "errors.validation.field.is.invalid.email",
  				},
  			},
  			length: {
  				lessThan: "errors.validation.field.length.lessThan",
  				moreThan: "errors.validation.field.length.moreThan",
  			},
  		},
  		fields: {
  			are: {
  				not: {
  					equal: {
  						password: "errors.validation.fields.are.not.equal.password",
  					},
  				},
  			},
  		},
  	},
  }
  */
  fillTreePaths(
  	{
  		validation: {
  			field: {
  				is: {
  					empty: "",
  					incorrect: {
  						password: "",
  					},
  					invalid: {
  						common: "",
  						email: "",
  					},
  				},
  				length: {
  					lessThan: "",
  					moreThan: "",
  				},
  			},
  			fields: {
  				are: {
  					not: {
  						equal: {
  							password: "",
  						},
  					},
  				},
  			},
  		},
  	},
  	"errors",
  );
  ```

- Define types for the resources

  ```typescript label="TypeScript" file="src/i18n/types.ts"
  import { SUPPORTED_LANGUAGES_MAP } from "./constants";
  import { dictionary } from "./dictionary";

  type Keys<Type> = keyof Type;

  type Values<Type> = Type[Keys<Type>];

  /*
  	Turns particular string values into abstract 'string' type.
  	It allows to type translations with I18nPaths subtypes, because otherwise
  	TypeScript will be complaining that values of translations are not the same
  	as paths ones.
  */
  type GetDictionary<Type> = Type extends string
  	? string
  	: { [Path in Keys<Type>]: GetDictionary<Type[Path]> };

  type Dictionary = GetDictionary<typeof dictionary>;

  type SupportedLanguage = Values<typeof SUPPORTED_LANGUAGES_MAP>;

  type Dictionaries = {
  	[Language in SupportedLanguage]: Dictionary;
  };

  export type { Dictionaries, Dictionary, SupportedLanguage };
  ```

- Define the resources (I called them `dictionaries` for consistency) for the supported languages

  ```typescript label="TypeScript" file="src/i18n/dictionaries/index.ts"
  import { Dictionaries } from "../types";

  import { englishDictionary as en } from "./en";
  import { russianDictionary as ru } from "./ru";
  // ... other dictionaries

  const dictionaries: Dictionaries = {
  	en,
  	ru,
  	// ... other dictionaries
  };

  export { dictionaries };
  ```

  ```typescript label="TypeScript" file="src/i18n/dictionaries/en/index.ts"
  import { Dictionary } from "i18n/types";

  import { errors } from "./errors";
  // ... other namespaces

  const englishDictionary: Dictionary = {
  	errors,
  	// ... other namespaces
  };

  export { englishDictionary };
  ```

  ```typescript label="TypeScript" file="src/i18n/dictionaries/en/errors.ts"
  import { Dictionary } from "i18n/types";

  const errors: Dictionary["errors"] = {
  	validation: {
  		field: {
  			is: {
  				empty: "This field is required",
  				incorrect: {
  					password: "Password is incorrect",
  				},
  				invalid: {
  					common: "Please enter a valid value",
  					email: "Please enter a valid email address",
  				},
  			},
  			length: {
  				lessThan: "This field should contain at least {minLength} characters",
  				moreThan: `This field should contain no more than {maxLength}
  				characters`,
  			},
  		},
  		fields: {
  			are: {
  				not: {
  					equal: {
  						password: "Passwords don't match",
  					},
  				},
  			},
  		},
  	},
  };

  export { errors };
  ```

  ```typescript label="TypeScript" file="src/i18n/dictionaries/ru/index.ts"
  import { Dictionary } from "i18n/types";

  import { errors } from "./errors";
  // ... other namespaces

  const russianDictionary: Dictionary = {
  	errors,
  	// ... other namespaces
  };

  export { russianDictionary };
  ```

  ```typescript label="TypeScript" file="src/i18n/dictionaries/ru/errors.ts"
  import { Dictionary } from "i18n/types";

  const errors: Dictionary["errors"] = {
  	validation: {
  		field: {
  			is: {
  				empty: "Это поле является обязательным для заполнения",
  				incorrect: {
  					password: "Неверный пароль",
  				},
  				invalid: {
  					common: "Пожалуйста, введите корректное значение",
  					email: "Пожалуйста, введите корректный адрес электронной почты",
  				},
  			},
  			length: {
  				lessThan: "Это поле должно состоять минимум из {minLength} символов",
  				moreThan: "Это поле должно состоять максимум из {maxLength} символов",
  			},
  		},
  		fields: {
  			are: {
  				not: {
  					equal: {
  						password: "Пароли не совпадают",
  					},
  				},
  			},
  		},
  	},
  };

  export { errors };
  ```

- Create i18n context, context provider and React Hook

  ```typescript label="TypeScript" file="src/i18n/context.tsx"
  import { HydrateText } from "hydrate-text";
  import * as React from "react";

  import { DEFAULT_SELECTED_LANGUAGE } from "./constants";
  import { SupportedLanguage } from "./types";
  import { isSupportedLanguage, textResolver } from "./utils";
  import { dictionaries } from "./dictionaries";

  interface I18nContextInterface {
  	selectedLanguage: SupportedLanguage;
  	setLanguage: (newSelectedLanguage: SupportedLanguage) => void;
  	translate: HydrateText;
  }

  const I18nContext = React.createContext<I18nContextInterface>({
  	selectedLanguage: DEFAULT_SELECTED_LANGUAGE,
  	setLanguage: () => {
  		// no-op
  	},
  	translate: () => "",
  });

  const I18nProvider: React.FC = ({ children }) => {
  	const [selectedLanguage, setLanguage] = React.useState<SupportedLanguage>(
  		DEFAULT_SELECTED_LANGUAGE,
  	);

  	React.useEffect(() => {
  		const searchParams = new URLSearchParams(window.location.search);

  		const language = searchParams.get("lng");

  		if (isSupportedLanguage(language)) {
  			setLanguage(language);
  		}
  	}, []);

  	const translate = React.useMemo(
  		() => textResolver(dictionaries[selectedLanguage]),
  		[selectedLanguage],
  	);

  	const value = {
  		selectedLanguage,
  		setLanguage,
  		translate,
  	};

  	return (
  		<I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  	);
  };

  const useI18n = (): I18nContextInterface => {
  	return React.useContext(I18nContext);
  };

  export { I18nContext, I18nProvider, useI18n };
  ```

  ```typescript label="TypeScript" file="src/i18n/utils.ts"
  import { HydrateText, hydrateText } from "hydrate-text";
  import get from "lodash/get";

  import { SUPPORTED_LANGUAGES_MAP } from "./constants";
  import { Dictionary, SupportedLanguage } from "./types";

  const textResolver =
  	(dictionary: Dictionary): HydrateText =>
  	(pathOrText, variables, interpolationOptions) => {
  		return hydrateText(
  			get(dictionary, pathOrText, pathOrText),
  			variables,
  			interpolationOptions,
  		);
  	};

  const isSupportedLanguage = (
  	language: string | null,
  ): language is SupportedLanguage => {
  	return Object.values(SUPPORTED_LANGUAGES_MAP).includes(
  		language as SupportedLanguage,
  	);
  };

  export { textResolver, isSupportedLanguage };
  ```

- Wrap the application in the context provider

  ```typescript label="TypeScript" file="src/main.tsx"
  import * as React from "react";
  import ReactDOM from "react-dom";

  import { I18nProvider } from "i18n";

  import { App } from "./app";

  ReactDOM.render(
  	<React.StrictMode>
  		<I18nProvider>
  			<App />
  		</I18nProvider>
  	</React.StrictMode>,
  	document.getElementById("root"),
  );
  ```

- Use the React Hook to get the translation function

  ```typescript label="TypeScript" file="src/app.tsx"
  import * as React from "react";

  import { dictionary, useI18n } from "i18n";

  const { field } = dictionary.errors.validation;

  const App: React.VFC = () => {
  	const { translate } = useI18n();

  	/*
  		"This field should contain at least 10 characters" for English.
  		"Это поле должно состоять минимум из 10 символов" for Russian.
  	*/
  	const translatedText = translate(field.length.lessThan, {
  		minLength: 10,
  	});

  	return <h1>{translatedText}</h1>;
  };

  export { App };
  ```

[Link to full source code](https://github.com/vasilii-kovalev/react-internationalization-hydrate-text).

Now all the problems are solved:

- The path to a localization string is not a plain string now, but a structure, that won't let you make a typo.
- The described approach adds ~8.3&nbsp;KiB to the bundle (the heaviest part is [`get` function from Lodash](https://lodash.com/docs/4.17.15#get), that takes ~6.8&nbsp;KiB). It is a way smaller than the previous one, and it is fully customizable on any level. Check out "Measuring application sizes" section below for more information.
- `Dictionary` type guarantees, that all resources (dictionaries) have the same structure.

## Keeping text organized

Even if localization is not necessary, I believe it is still a good idea to keep text organized. In this case, the following approach can be used:

- Define a text constant

  ```typescript label="TypeScript" file="src/constants/text/errors.ts"
  const ERRORS_TEXT = {
  	validation: {
  		field: {
  			is: {
  				empty: "This field is required",
  				incorrect: {
  					password: "Password is incorrect",
  				},
  				invalid: {
  					common: "Please enter a valid value",
  					email: "Please enter a valid email address",
  				},
  			},
  			length: {
  				lessThan: "This field should contain at least {minLength} characters",
  				moreThan: `This field should contain no more than {maxLength}
  				characters`,
  			},
  		},
  		fields: {
  			are: {
  				not: {
  					equal: {
  						password: "Passwords don't match",
  					},
  				},
  			},
  		},
  	},
  };
  ```

- Use `hydrate‑text` to provide the text with variables

  ```typescript label="TypeScript" file="src/app.tsx"
  import { hydrateText } from "hydrate-text";
  import * as React from "react";

  import { ERRORS_TEXT } from "constants/text/errors";

  const { field } = ERRORS_TEXT.validation;

  const App: React.VFC = () => {
  	/*
  		"This field should contain at least 10 characters".
  	*/
  	const text = hydrateText(field.length.lessThan, {
  		minLength: 10,
  	});

  	return <h1>{text}</h1>;
  };

  export { App };
  ```

## Replacing route variables

In some cases, it is necessary to provide [React Router](https://reactrouter.com/) routes with variables, like this:

```typescript label="TypeScript"
// Given
"/posts/:id";

// Needed (for example, `id` is 10)
"/posts/10";
```

To achieve this, an ability to replace default variable markers was added. In the source code it is called "interpolation options" (this name was taken from `i18next` ["Interpolation" page](https://www.i18next.com/translation-function/interpolation#additional-options)):

```typescript label="TypeScript"
// "/posts/10"
hydrateText(
	"/posts/:id",
	{ id: 10 },
	{
		prefix: ":",
		suffix: "",
	},
);
```

If it is necessary to do this in several places, it is better to use another function from `hydrate‑text` - `configureHydrateText`, which will return `hydrateText` function bound to the chosen variable markers:

```typescript label="TypeScript"
const hydrateRoute = configureHydrateText({
	prefix: ":",
	suffix: "",
});

// "/posts/10"
hydrateRoute("/posts/:id", { id: 10 });
```

The markers still can be changed via the third argument, but I can hardly imagine, when it can be useful 🙂

Later on I found a built-in function [generatePath](https://reactrouter.com/web/api/generatePath), but the examples above are still valid as an illustration of the variable markers changing flexibility.

## Measuring application sizes

### i18next approach

In each case, check console results and sum up `dist/assets/index.<hash>.js` and `dist/assets/vendor.<hash>.js` sizes.

1. Build the application as is: **1.34&nbsp;KiB + 181.54&nbsp;KiB**.
2. Replace `<App />` by `null`, comment out `i18n` and `App` imports and build the application: **0.14&nbsp;KiB + 127.59&nbsp;KiB**.

The sizes were double-checked with [filesize VS Code extension](https://marketplace.visualstudio.com/items?itemName=mkxml.vscode-filesize).

We miss `withTranslation` and `useTranslation` import costs, but I don't think it drastically changes the picture.

### hydrate‑text approach

In each case, check console results and sum up `dist/assets/index.<hash>.js` and `dist/assets/vendor.<hash>.js` sizes.

1. Build the application as is: **2.16&nbsp;KiB + 133.91&nbsp;KiB**.
2. Replace `get(dictionary, pathOrText, pathOrText)` by `pathOrText`, comment out `get` import and build the application: **1.25&nbsp;KiB + 128.01&nbsp;KiB**.
3. Replace `<I18nProvider><App /></I18nProvider>` by `null`, comment out `I18nProvider` and `App` imports and build the application: **0.14&nbsp;KiB + 127.59&nbsp;KiB**.

The sizes were double-checked with [filesize VS Code extension](https://marketplace.visualstudio.com/items?itemName=mkxml.vscode-filesize).
