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
  config.addShortcode("codeheader", (language, file) => {
    if (file === undefined) {
      return `<div class="code-header">
          <span class="code-header__language">
            ${language}
          </span>
        </div>`;
    }

    return `<div class="code-header">
        <span class="code-header__language">
          ${language}
        </span>
        <span class="code-header__file">${file}</span>
      </div>`;
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
