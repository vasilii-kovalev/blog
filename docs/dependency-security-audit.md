# Dependency security audit

Open `npm audit` findings that start from a direct dependency in `package.json`. Each `Fix` line is the condition for deleting the related override, or for the finding to clear when there is nothing to delete. Each `Track` line is the issue, pull request, or commit to recheck.

- `stylelint@17.16.0` → `micromatch@4.0.8` → `braces@3.0.3`
  - Fix: Wait until a stable `stylelint` 18 is published, or until `braces` publishes a version above 3.0.3 and `stylelint` 17 depends on it through `micromatch`, `fast-glob`, or `globby`. `stylelint-config-standard` and `stylelint-order` are flagged only because they depend on `stylelint`, so they clear with it. There is no override to remove.
  - Track: [Release 18.0.0](https://github.com/stylelint/stylelint/issues/9604) is open. `18.0.0-next.0` already uses `tinyglobby` and `picomatch` instead of `micromatch`. Staying on 17 also clears when `braces` publishes a version above 3.0.3. [Uncontrolled recursion depth](https://github.com/micromatch/braces/issues/70) and [no fixed release available](https://github.com/micromatch/braces/issues/73) are open. [A patched release was requested](https://github.com/micromatch/braces/issues/84) and closed with no release planned. Open fix pull requests: [#78](https://github.com/micromatch/braces/pull/78), [#79](https://github.com/micromatch/braces/pull/79), [#82](https://github.com/micromatch/braces/pull/82), [#87](https://github.com/micromatch/braces/pull/87), and [#88](https://github.com/micromatch/braces/pull/88). [#75](https://github.com/micromatch/braces/pull/75) was closed without merging.

## Replacements

- `stylelint`
  - Stylelint 18: 31 packages instead of 116, and its own tree has no `braces`. Stable 18 and matching companion configs are not out yet.
- `cspell-check-unused-words`
  - A release on `cspell` 10.4.0: removes the second CSpell tree of 26 packages. Version 1.6.3 still pins 10.0.1.
