# Search engine comparison

Comparison date: **2026-10-22**.

## Scope and requirements

The site is an Astro personal blog deployed as static files to GitHub Pages under `/blog/`. Search must run in the browser without a backend or third-party service. The post list must remain usable without JavaScript.

The search component must:

- Search titles, descriptions, headings, and article bodies, including code.
- Support prefixes and misspellings.
- Require every query term to match somewhere in a post, including across different fields.
- Rank title matches above heading matches, and heading matches above body matches.
- Integrate with a custom, framework-free interface.
- Prepare the index at build time rather than index articles in the browser.
- Return post IDs; titles and descriptions already exist in the rendered post list.

Matching excerpts, section links, and tag filters are possible extensions, not requirements of the existing component. English prose, Russian text, and programming identifiers all occur in the content.

All seven engines below are free and open source and can operate locally without a hosted service. Commercial products associated with a project are separate from the libraries evaluated here.

## Existing implementation and measurements

The search component uses MiniSearch 7.2.0, following the build-time data preparation and browser-side search approach described in Evil Martians' [How to add fast, client-side search to Astro static sites](https://evilmartians.com/chronicles/how-to-add-fast-client-side-search-to-astro-static-sites).

The build extracts searchable text from the rendered Markdown tree and creates a serialized MiniSearch index. It does not store the original article bodies as retrievable documents. The browser downloads the complete index on home-page load and restores it with `MiniSearch.loadJSON`.

The index has a content-hashed URL. The browser filters and reorders existing post-list elements rather than rendering result markup from index data. This preserves the complete list before search loads and when JavaScript is unavailable.

A production build and the deployed site with one article gave these measurements on 2026-10-22:

| Asset                                                       | Uncompressed bytes | Local gzip bytes | Deployed gzip response-body bytes |
| ----------------------------------------------------------- | -----------------: | ---------------: | --------------------------------: |
| Search JavaScript, including MiniSearch and the client code |             18,870 |            6,227 |                             6,296 |
| Serialized search index                                     |             16,381 |            3,349 |                             3,378 |
| Combined                                                    |             35,251 |            9,576 |                             9,674 |

Local gzip sizes use Node.js `gzipSync`. The deployed measurements use the actual search asset URLs extracted from [the homepage](https://vasilii-kovalev.github.io/blog/): [the search script](https://vasilii-kovalev.github.io/blog/_astro/search.astro_astro_type_script_index_0_lang.DJV1fXt8.js) and [the index](https://vasilii-kovalev.github.io/blog/search-index-1b88164f.json). SHA-256 checks of the decoded responses match the local files.

The deployed gzip sizes are downloaded HTTP response-body bytes measured with curl's `size_download`, requesting `Accept-Encoding: gzip` without automatic decompression. Both responses returned HTTP 200 without redirects, `Content-Encoding: gzip`, `Vary: Accept-Encoding`, and `Cache-Control: max-age=600`; their `Content-Length` values matched the measured body sizes. Separate requests accepting only Brotli returned uncompressed bodies, not Brotli. These measurements exclude HTTP headers, protocol overhead, HTML, and CSS, and represent full responses rather than cached browser visits.

Reproduce the local measurements with `npm run prod:build`, then measure the generated search script in `dist/_astro/` and `search-index-*.json` in `dist/`. For deployed measurements, extract the current asset URLs from the homepage and run `curl -sS -L -H "Accept-Encoding: gzip" -o /dev/null -w "%{size_download}\n" "<asset-url>"` for each asset; on Windows use `curl.exe` and `-o NUL`. Inspect response headers with `-D -` to confirm the encoding and status. Do not add `--compressed`, which would decode the downloaded output.

Checks against that index returned the article for `i18next`, `i18nex`, `i18nxt`, `hydrate-text`, `useTranslation`, `react i18next`, and a Russian word from the article. `react nonexistentword` returned no results. The code-caption path `src/i18n/index.js` returned no results; captions are excluded by the text-extraction plugin.

One article cannot establish ranking quality, realistic index growth, or comparative performance. The other engines have not been integrated or benchmarked against this corpus. Upstream benchmark claims and standalone library sizes are not substitutes for measuring the complete implementation.

## Summary

| Engine     | License    | Best fit                                                                   | Main limitation for this component                                                |
| ---------- | ---------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| MiniSearch | MIT        | Build-time full-text index with field boosts, prefixes, and typo tolerance | Complete index download; excerpts need a separate text source                     |
| Pagefind   | MIT        | Static article search with chunked delivery, excerpts, and section links   | No native edit-distance typo tolerance equivalent to MiniSearch                   |
| Fuse.js    | Apache-2.0 | Fuzzy record search with weighted fields and match positions               | Searchable field text must be available in the browser                            |
| FlexSearch | Apache-2.0 | Configurable indexing, encoders, workers, and document highlighting        | More configuration; phonetic matching is not equivalent to edit-distance matching |
| Orama      | Apache-2.0 | Full-text search combined with structured filters and facets               | More database functionality and stored data than ID-only results need             |
| Lunr       | MIT        | Prebuilt full-text indexes and an explicit query language                  | Long maintenance inactivity; English-oriented defaults need adaptation            |
| uFuzzy     | MIT        | Short-string filtering, autocomplete, and identifier lookup                | Not a field-aware article relevance engine                                        |

Licenses refer to the published packages in the maintenance table. Review the license and dependencies of the exact version before adoption.

## Engine evaluations

### MiniSearch

[MiniSearch](https://github.com/lucaong/minisearch) directly supports the existing field boosts, AND combination, prefix matching, fuzzy matching, and index serialization. The build and browser share configuration, and the result IDs map directly to the existing post list.

Its index-only design avoids a stored copy of each article body. That does not mean article content is private: a full-text index still encodes vocabulary and document associations, and the articles are public.

The current whole-index delivery grows with the corpus. Highlighted excerpts would require retaining or fetching source text and implementing excerpt selection; index match information alone is not the original passage. Tag filtering can be implemented with post metadata and is not by itself a reason to replace the engine.

**Conditions for retaining it:** the required queries have acceptable relevance, measured download and initialization costs remain within the site's budget, and the maintenance risk remains acceptable. First consider configuration or loading-policy changes when they solve the problem without changing search semantics.

**Conditions for replacing it:** a measured performance or relevance problem survives reasonable tuning; excerpts and section navigation justify a more integrated engine; or an unresolved compatibility/security issue and lack of upstream response make continued ownership impractical.

### Pagefind

[Pagefind](https://pagefind.app/) indexes generated HTML after the static-site build. It emits a browser search bundle and fetches index chunks as needed instead of requiring the entire index before searching. Result text is loaded separately.

Its [search API](https://pagefind.app/docs/api/) provides excerpts, highlighted matches, and section-level sub-results. [Content weights](https://pagefind.app/docs/weighting/) boost headings by default and can be customized. Filters and metadata support topic-based search. Its prebuilt UI is optional: the current input and no-JavaScript post list can remain.

For this site, [indexing controls](https://pagefind.app/docs/indexing/) can restrict indexing to articles, exclude navigation and the homepage, and include or exclude rendered code captions. Indexing HTML avoids a separate Markdown text-extraction path. Programming punctuation needs deliberate configuration because Pagefind strips most punctuation by default.

Pagefind supports prefix matching and language-dependent stemming, but these do not correct arbitrary misspellings. Native edit-distance typo tolerance remains an [upstream feature request](https://github.com/Pagefind/pagefind/issues/756). This is a behavioral trade-off, not just an integration detail.

Migration requires:

- A post-build indexing step and a built-index workflow for development/preview.
- Content markers and metadata in article templates.
- Correct bundle and result URLs under `/blog/`.
- Asynchronous search, cancellation or stale-response protection, and explicit loading/error states.
- A mapping from result metadata or URLs to existing posts if the current list-reordering UI is preserved; Pagefind IDs are not the blog's post IDs.
- Verification of asset/cache consistency across deployments rather than assuming the existing content-hashed endpoint's behavior transfers unchanged.

[Multilingual indexing](https://pagefind.app/docs/multilingual/) normally separates pages by their HTML language. This is useful for translated sites, but mixed Russian text inside an English article still needs testing; language support does not guarantee the desired mixed-language stemming.

**Switch when:** matching excerpts or section links are wanted and reduce enough custom code to justify migration, or whole-index transfer exceeds the agreed budget and Pagefind measurably improves first-use cost. The query suite must confirm acceptable relevance, and the loss of current typo tolerance must either be acceptable or resolved by a released upstream feature.

Do not switch solely because the archive reaches a particular article count. Content length, vocabulary, query distribution, and actual network requests matter more than count alone.

### Fuse.js

[Fuse.js](https://www.fusejs.io/) supports fuzzy matching, weighted fields, logical queries, and match positions for highlighting. Published version 7.5.0 includes [token search](https://github.com/krisk/Fuse/blob/v7.5.0/docs/token-search.md): it matches words independently, uses IDF weighting, and supports `tokenMatch: "all"` across fields. Evaluating it only as a whole-query fuzzy matcher would miss this capability.

The ordinary [fuzzy-search defaults](https://www.fusejs.io/fuzzy-search.html) penalize matches far from the start of a field. Long-body search needs `ignoreLocation` or suitable token-search configuration; token search ignores location during per-term matching. Tokenization can be customized for package names and punctuation. The documented Bitap limit is per search term; token search avoids treating a multi-word query as one long pattern.

Fuse needs searchable field text in the browser even when its index is prepared ahead of time. It therefore does not reproduce MiniSearch's index-only body search merely by serializing an index. Match positions can help build excerpts, but passage selection and presentation remain application work. There is no equivalent built-in static-site chunk-delivery pipeline to Pagefind's.

**Switch when:** weighted fuzzy record matching or match-position output delivers demonstrably better results for the chosen UX, and complete text plus index/library costs fit the budget. A deliberate reduction to title/description search makes Fuse more attractive. For full article search, require measured relevance or implementation benefits rather than assuming a smaller library means a smaller total download.

### FlexSearch

[FlexSearch](https://github.com/nextapps-de/flexsearch) provides multi-field document indexes, tag search, configurable tokenization/encoding, workers, and [highlighting with excerpt boundaries](https://github.com/nextapps-de/flexsearch/blob/master/doc/result-highlighting.md). Highlighting requires the document store, so it is not free in payload or memory.

Its [encoders](https://github.com/nextapps-de/flexsearch/blob/master/doc/encoder.md) perform normalization and optional phonetic transformations. Default encoding also deduplicates letters and filters punctuation. These choices can improve natural-language recall but blur distinctions in identifiers. Prefix tokenization and phonetic matching are not a guarantee of the same misspelling behavior as MiniSearch's edit-distance matching.

Multi-field results, merging, and ordering need explicit design to preserve title/heading/body priorities and cross-field AND behavior. Existing boost numbers cannot simply be transferred between scoring models.

[Index export/import](https://github.com/nextapps-de/flexsearch/blob/master/doc/export-import.md) is supported, but that documentation excludes worker and persistent indexes from the normal export/import mechanism. Its experimental fast-boot serialization does not support document indexes. Build-time indexing and worker execution therefore need validation together, not as independent feature guarantees.

**Switch when:** representative measurements show an unresolved indexing/query bottleneck and a specific FlexSearch configuration materially improves it while preserving relevance, typo expectations, cross-field matching, and manageable serialized size. Worker support alone is insufficient justification: moving the existing work off the main thread may be a smaller change.

### Orama

[Orama](https://github.com/oramasearch/orama) combines full-text relevance, field boosts, configurable typo tolerance, stemming, typed document schemas, structured filters, and facets. Its local open-source engine does not require its hosted service, vector search, or AI features.

This is attractive for searches combining article text with topics, dates, or other structured metadata. Plain tag filtering alone can also be implemented around MiniSearch and does not require a database-like engine.

The standard [save/load format](https://github.com/oramasearch/orama/blob/v3.1.18/packages/orama/src/methods/serialization.ts) includes the document store as well as indexes. Payload and memory must be measured against the existing index-only design. Set typo tolerance and multi-term matching explicitly and test cross-field behavior rather than assuming defaults match the current component. Excerpts and section navigation also need their own integration; full-text support does not imply Pagefind's article-oriented presentation.

**Switch when:** several structured filters, facets/counts, or typed search operations become real requirements and Orama removes substantial custom logic while meeting size and latency budgets. Alternatively, require demonstrated full-text relevance benefits that outweigh its additional data and integration costs. Vector or hybrid features only count as benefits if there is a concrete requirement and a viable local embedding workflow.

### Lunr

[Lunr](https://lunrjs.com/) is a full-text engine with BM25 relevance, field boosts, and [building JSON indexes ahead of time](https://lunrjs.com/guides/index_prebuilding.html). It can return document references without shipping stored article bodies, so its architecture is compatible with the existing result list and hashed-index endpoint.

Its [query language](https://lunrjs.com/guides/searching.html) supports field restrictions, required/prohibited terms, wildcards, term boosts, and edit-distance matching. Defaults combine terms with OR; requiring each term reproduces AND-style filtering. Prefixes and misspellings require deliberate query construction. Wildcard terms bypass stemming, so combining stemming, prefix expansion, and fuzzy behavior needs tests rather than mechanical option translation.

Passing arbitrary input directly to the query parser also gives punctuation syntactic meaning. A normal blog search should use the programmatic query API or safely handle query syntax and parse errors. Users should not need to learn operators to preserve existing behavior.

Lunr's [default pipeline](https://github.com/olivernn/lunr.js/blob/master/lib/lunr.js) includes English stop-word removal and stemming. Its [trimmer explicitly warns about non-Latin text](https://github.com/olivernn/lunr.js/blob/master/lib/trimmer.js). Russian text and code identifiers require a different or customized pipeline, consistently registered when building and loading indexes. External language plugins introduce an additional dependency and maintenance decision.

Optional token-position metadata can support highlighting, but increases index data and still needs original passages from another source. Lunr does not supply Pagefind-style excerpt storage, section navigation, or query-driven index chunk delivery. Its published JavaScript package also needs separate consideration for TypeScript declarations.

The maintenance gap is the main adoption obstacle: the latest release and default-branch commit are from 2020. A mature API is not evidence that future browser, tooling, or security problems will receive fixes.

**Switch when:** an existing Lunr index/integration must be reused, or its query language is a concrete requirement that cannot be met economically with the other candidates; a prototype must still meet relevance, multilingual, and payload requirements. In addition, require resumed substantive maintenance or an explicitly owned and maintained fork. Under the observed maintenance state, it is not a preferred new dependency for this blog.

### uFuzzy

[uFuzzy](https://github.com/leeoniya/uFuzzy), published as `@leeoniya/ufuzzy`, targets short-to-medium strings: titles, names, filenames, functions, autocomplete, and list filtering. It scans strings without building a persistent full-text index. Avoiding an index does not avoid downloading the searchable strings.

Its matching model is deliberately different from article relevance ranking:

- The default mode preserves the order of query characters while allowing configured insertions.
- Configurable single-error matching can permit substitutions, transpositions, insertions, and deletions. It is not equivalent to MiniSearch's proportional fuzzy threshold.
- Match boundaries can recognize punctuation, letter/number transitions, and camel-case identifiers.
- Match ranges and detailed match statistics support highlighting and custom sorting.
- Out-of-order terms are supported, but must be enabled with care: the [typed API](https://github.com/leeoniya/uFuzzy/blob/main/dist/uFuzzy.d.ts) documents a permutation limit, with factorial growth as that limit increases.

There is no built-in title/heading/body relevance model, corpus-level IDF ranking, or article excerpt/section pipeline. Searching fields separately and merging results, or concatenating them and reconstructing field priorities, would become application logic. Ranking also has a configurable candidate threshold; a large match set does not automatically receive the same detailed ranking as a small one.

Defaults favor Latin text. The README documents explicit Russian alphabet configuration and a Unicode alternative, with a performance trade-off. These must be exercised against mixed-language content and identifiers. All searches are case-insensitive, so it is unsuitable if exact case-sensitive identifier lookup becomes a requirement.

**Switch when:** the product deliberately becomes title/description or identifier filtering rather than ranked full-article search, and boundary-aware matching improves the chosen query set. Require Unicode/Russian coverage, predictable out-of-order query costs, and measured total payload/latency benefits. For the existing full-text scope, additional merging/ranking code makes it a poor replacement even though the library itself is small.

## Maintenance and dependency health

The following snapshot separates npm publication from source activity. A repository's last push can refer to another branch or tag; it is not the same as a default-branch code change. None of the seven repositories was archived on the comparison date.

| Engine     | Latest npm stable version | Published  | Latest observed default-branch commit | Assessment                                                                                                                        |
| ---------- | ------------------------- | ---------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| MiniSearch | 7.2.0                     | 2025-09-16 | 2025-09-16                            | Mature but quiet for over a year; limited evidence of current responsiveness                                                      |
| Pagefind   | 1.5.2                     | 2026-04-12 | 2026-10-21                            | Active repository; latest sampled commits are dependency maintenance; released fixes include indexing and deterministic filenames |
| Fuse.js    | 7.5.0                     | 2026-07-13 | 2026-08-09                            | Recent stable fixes and subsequent beta development; distinguish stable APIs from unreleased changes                              |
| FlexSearch | 0.8.212                   | 2025-09-06 | 2026-05-29                            | Source maintenance is newer than the published package; verify that required fixes are actually released                          |
| Orama      | 3.1.18                    | 2025-12-19 | 2026-07-03                            | Multiple contributors and substantive language/highlighting fixes; published version lags inspected source activity               |
| Lunr       | 2.3.9                     | 2020-08-19 | 2020-08-19                            | High maintenance-continuity risk for new adoption; not archived, but long inactive                                                |
| uFuzzy     | 1.0.19                    | 2025-08-22 | 2026-09-08                            | Intermittent substantive source maintenance; confirm whether needed changes are in the published package                          |

### Evidence and limits

Publication dates, stable versions, and package licenses come from the public npm metadata:

- [minisearch](https://registry.npmjs.org/minisearch)
- [pagefind](https://registry.npmjs.org/pagefind)
- [fuse.js](https://registry.npmjs.org/fuse.js)
- [flexsearch](https://registry.npmjs.org/flexsearch)
- [@orama/orama](https://registry.npmjs.org/@orama%2Forama)
- [lunr](https://registry.npmjs.org/lunr)
- [@leeoniya/ufuzzy](https://registry.npmjs.org/@leeoniya%2Fufuzzy)

Source activity is independently visible in the [MiniSearch](https://github.com/lucaong/minisearch/commits/master/), [Pagefind](https://github.com/Pagefind/pagefind/commits/main/), [Fuse.js](https://github.com/krisk/Fuse/commits/main/), [FlexSearch](https://github.com/nextapps-de/flexsearch/commits/master/), [Orama](https://github.com/oramasearch/orama/commits/main/), [Lunr](https://github.com/olivernn/lunr.js/commits/master/), and [uFuzzy](https://github.com/leeoniya/uFuzzy/commits/main/) histories.

[Pagefind 1.5.2 release notes](https://github.com/Pagefind/pagefind/releases/tag/v1.5.2) document concrete fixes beyond dependency updates. [Fuse's changelog](https://github.com/krisk/Fuse/blob/main/CHANGELOG.md) records stable ranking fixes and distinguishes its later beta. Recent uFuzzy activity includes expanded accent normalization; recent Orama activity includes language and highlighting fixes. These source changes do not prove inclusion in the stable versions above.

The npm metadata lists one publisher account each for MiniSearch, Pagefind, Fuse.js, FlexSearch, Lunr, and uFuzzy; Orama lists two. Publisher accounts are not a count of contributors or proof of who can recover access. Organization ownership and corporate backing do not by themselves establish resilient release governance.

This is a release/source continuity assessment, not a security audit or a guarantee about future maintainer behavior. Stars, download counts, a non-archived repository, and bot activity alone do not establish responsiveness. No issue-response service level or comprehensive incident history has been verified.

Before adopting or upgrading an engine:

- Check that required fixes exist in an actual stable release, not just a branch.
- Inspect recent substantive fixes, issue responses relevant to supported environments, ownership transfers, deprecation notices, and license changes.
- Review the exact dependency tree and install scripts, including native build wrappers where applicable.
- Pin versions, preserve lockfile integrity, and keep build and browser versions compatible.
- Retain reproducible static output and a tested no-JavaScript/error fallback.

A year without releases is a reason to examine responsiveness, not automatic proof of abandonment. An unresolved blocking defect without upstream response, an unexplained ownership/license change, or a deprecated/archived package is a stronger migration trigger. MiniSearch's quiet period belongs in this assessment even though it is already installed.

## Migration decision criteria

A migration should solve an observed problem or deliver a wanted feature, pass the maintenance gate, and preserve explicitly retained behavior. Article count or an upstream speed claim alone is not sufficient.

### Measurements

Use real articles spanning different lengths, topics, languages, and code samples. Repeated copies of one article do not reproduce realistic vocabulary or ranking.

Measure the complete implementation, including:

- Compressed search JavaScript, index data, stored text, workers, and WebAssembly where present.
- Bytes requested before interaction, on the first query, and across a representative query session.
- Cold-load initialization and first-result time on a slower device/network.
- Warm-query latency, main-thread blocking, and memory.
- Build cost and the number of integration components that need maintenance.

Suggested starting review thresholds are **100 KiB of compressed search assets/data requested before interaction**, **200 ms of main-thread initialization work**, or **50 ms at the 95th percentile for warm queries on the chosen slower device**. These are proposed investigation budgets, not measured failures, universal UX limits, or automatic migration rules. Record the device, network, corpus, and chosen budgets with benchmark results.

If only initial transfer is excessive, compare loading on focus or first input before replacing the engine. If only main-thread work is excessive, compare asynchronous loading or worker execution. A replacement should measurably improve the failing metric without unacceptable relevance or complexity regressions.

### Behavioral acceptance

Build an expected-results set covering:

- Exact title, heading, description, and body matches, with expected top-result ordering.
- Prefixes and misspellings such as `i18nex` and `i18nxt`.
- Terms split across fields, terms in reversed order, and a valid term combined with a nonexistent one.
- Long multi-word queries and matches late in long articles.
- Mixed English/Russian text and accented words.
- `node.js`, `hydrate-text`, `C++`, camel-case identifiers, and file paths, with explicit punctuation expectations.
- Empty input, punctuation-only input, zero results, failed requests, retry, and rapid successive input.
- `/blog/` URLs, keyboard/screen-reader behavior, and the unchanged no-JavaScript list.

The current index returning a document for `node.js` does not prove literal punctuation-sensitive matching. Likewise, code captions becoming searchable is a content-policy change, not an automatic correctness improvement.

When adding excerpts, test match positioning, safe HTML handling, fetch failures, and section anchors. When adding filters, test counts and combinations with text search. For an asynchronous engine, verify that older queries cannot replace newer results. Intentionally changed semantics, including loss of typo tolerance, must be accepted explicitly.

## Conclusion

MiniSearch is the best fit for the existing ID-only, build-time full-text search: it meets the matching requirements with a small measured payload and little integration code. Its maintenance inactivity is a qualification, not something the feature fit removes.

Pagefind is the strongest alternative for article-oriented search with excerpts, section links, or query-driven chunk delivery, provided its typo-tolerance trade-off is acceptable. Fuse.js is a credible alternative for fuzzy record matching; FlexSearch needs a demonstrated performance/configuration advantage; Orama needs structured-search requirements substantial enough to justify its broader model.

uFuzzy becomes attractive if the scope shifts to short-string or identifier filtering. Lunr is technically compatible with prebuilt full-text search, but its maintenance gap makes it unsuitable as a preferred new dependency without resumed maintenance or an owned fork. No replacement is justified solely by the current one-article measurements.
