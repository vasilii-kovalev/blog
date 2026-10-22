# Dependency security audit

Open `npm audit` findings that start from a direct dependency in `package.json`. Each `Fix` line is the condition for deleting the related override, or for the finding to clear when there is nothing to delete. Each `Track` line is the issue, pull request, or commit to recheck.

- `stylelint@17.16.0` → `micromatch@4.0.8` → `braces@3.0.3`
  - Fix: Wait until a stable `stylelint` 18 is published, or until `braces` publishes a version above 3.0.3 and `stylelint` 17 depends on it through `micromatch`, `fast-glob`, or `globby`. `stylelint-config-standard` and `stylelint-order` are flagged only because they depend on `stylelint`, so they clear with it. There is no override to remove.
  - Track: [Release 18.0.0](https://github.com/stylelint/stylelint/issues/9604) is open. `18.0.0-next.0` already uses `tinyglobby` and `picomatch` instead of `micromatch`. Staying on 17 also clears when `braces` publishes a version above 3.0.3. [Uncontrolled recursion depth](https://github.com/micromatch/braces/issues/70) and [no fixed release available](https://github.com/micromatch/braces/issues/73) are open. [A patched release was requested](https://github.com/micromatch/braces/issues/84) and closed with no release planned. Open fix pull requests: [#78](https://github.com/micromatch/braces/pull/78), [#79](https://github.com/micromatch/braces/pull/79), [#82](https://github.com/micromatch/braces/pull/82), [#87](https://github.com/micromatch/braces/pull/87), and [#88](https://github.com/micromatch/braces/pull/88). [#75](https://github.com/micromatch/braces/pull/75) was closed without merging.
- `gh-pages@6.3.0` → `globby@11.1.0` → `fast-glob@3.3.3` → `micromatch@4.0.8` → `braces@3.0.3`
  - Fix: Wait until a `gh-pages` release newer than 6.3.0 is published. `main` already replaced `globby` with `tinyglobby`, which does not depend on `braces`. The published 6.3.0 package still has this chain. There is no override to remove.
  - Track: [chore: switch to tinyglobby](https://github.com/tschaub/gh-pages/pull/622) is merged and not yet published. [braces CVE-2026-93687 via globby](https://github.com/tschaub/gh-pages/issues/658) is open. The same `braces` pull requests apply to the published 6.3.0 chain.
- `gh-pages@6.3.0` → `find-cache-dir@3.3.2` → `make-dir@3.1.0` → `semver@^6.0.0`
  - Fix: Drop the `make-dir` `semver` override when `make-dir` no longer accepts `semver` below 6.3.1, or when `gh-pages` no longer depends on `make-dir` 3. The current range is `^6.0.0`, which still includes the vulnerable 6.3.0. Current `gh-pages` `main` still depends on `find-cache-dir` 3.
  - Track: No open pull request narrows that range. Patched `semver` 6.3.1 is already merged in [chore: release 6.3.1](https://github.com/npm/node-semver/pull/593).

## Replacements

- `gh-pages`
  - Local git script: removes the `semver` override and the 30 packages only this package installs, and keeps publishing local.
  - A release newer than 6.3.0: drops this package's `braces` chain. The `semver` override stays.
  - `oneclickpush`: zero dependencies. Created 12 October 2026, so the release cooldown rules it out for now.
- `stylelint`
  - Stylelint 18: 31 packages instead of 116, and its own tree has no `braces`. Stable 18 and matching companion configs are not out yet.
- `cspell-check-unused-words`
  - A release on `cspell` 10.4.0: removes the second CSpell tree of 26 packages. Version 1.6.3 still pins 10.0.1.
