# TODO

- [ ] Decide whether search results should show matching snippets, which would bring the post text back into the index
- [ ] Check how the search index grows with the number of posts, and whether loading it on page load stays reasonable
- [ ] Use the `tags` field to filter posts
  - [ ] Replace the Eleventy-style `post` tag with topic tags
  - [ ] Decide how filtering by tags should look: tag pages or a filter next to the search
- [ ] Revisit [syntax highlighting](https://docs.astro.build/en/guides/syntax-highlighting/) once the site's design settles
- [ ] Decide whether code captions (language and file names) should be searchable
- [ ] Restore the upstream `monospace, monospace` in `normalize.css` once [parcel-bundler/lightningcss#1221](https://github.com/parcel-bundler/lightningcss/issues/1221) is fixed
