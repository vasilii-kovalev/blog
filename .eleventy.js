const fs = require("fs");

const cleanCSS = require("clean-css");
const htmlmin = require("html-minifier");
const anchor = require("markdown-it-anchor");
const markdown = require("markdown-it");

const OUTPUT_DIRECTORY_NAME = "dist";

fs.rmSync(OUTPUT_DIRECTORY_NAME, { force: true, recursive: true });

module.exports = config => {
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
    html: true,
  }).use(anchor, {
    permalink: anchor.permalink.headerLink(),
  });

  config.setLibrary("md", markdownLibrary);

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
    templateFormats: ["md", "njk", "webmanifest", "jpg", "png", "svg", "ico"],
  };
};
