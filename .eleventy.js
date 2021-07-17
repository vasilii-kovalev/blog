const fs = require("fs");

const cleanCSS = require("clean-css");
const htmlmin = require("html-minifier");
const markdown = require("markdown-it");
const anchor = require("markdown-it-anchor");

const OUTPUT_DIRECTORY_NAME = "dist";

fs.rmSync(OUTPUT_DIRECTORY_NAME, {
  force: true,
  recursive: true,
});

module.exports = config => {
  // Copying files
  config.addPassthroughCopy("src/assets/**/*.{webmanifest,png,svg}");
  config.addPassthroughCopy({ "src/assets/**/*.ico": "/" });

  // Shortcodes
  config.addPairedShortcode("logo", (title, homeUrl, isHomePage) => {
    if (isHomePage) {
      return `<span class="header__logo header__logo--text">
        ${title}
      </span>`;
    }

    return `<a href="${homeUrl}" class="header__logo">
      ${title}
    </a>`;
  });

  config.addPairedShortcode("codeblock", (snippet, language, file) => {
    if (file === undefined) {
      return `<figure aria-label="A block of code" class="code-block">
        <figcaption class="code-block__header code-header">
          <dl class="code-header__info">
            <dt class="visually-hidden">Language</dt>
            <dd class="code-header__language">${language}</dd>
          </dl>
        </figcaption>
        ${snippet}</figure>`;
    }

    return `<figure aria-label="A block of code" class="code-block">
      <figcaption class="code-block__header code-header">
        <dl class="code-header__info">
          <dt class="visually-hidden">Language</dt>
          <dd class="code-header__language">${language}</dd>
          <dt class="visually-hidden">File</dt>
          <dd class="code-header__file">${file}</dd>
        </dl>
      </figcaption>
      ${snippet}</figure>`;
  });

  // Libraries
  const markdownLibrary = markdown({
    // Otherwise shortcodes don't work
    html: true,
  }).use(anchor, {
    permalink: anchor.permalink.headerLink(),
  });

  config.setLibrary("md", markdownLibrary);

  // Filters
  config.addFilter("date", dateString => {
    const date = new Date(dateString);

    return date.toLocaleString("en", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // Minify HTML
  config.addTransform("htmlmin", (content, outputPath) => {
    if (outputPath?.endsWith(".html")) {
      const minifiedHTML = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });

      return minifiedHTML;
    }

    return content;
  });

  // Minify and inline CSS
  config.addFilter("cssmin", code => {
    return new cleanCSS({}).minify(code).styles;
  });

  return {
    dataTemplateEngine: "njk",
    dir: {
      data: "data",
      includes: "includes",
      input: "src",
      layouts: "layouts",
      output: OUTPUT_DIRECTORY_NAME,
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["md", "njk"],
  };
};
