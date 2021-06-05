const headings = require("remark-autolink-headings");
const slug = require("remark-slug");

export default () => ({
  webpack: (config) => {
    config.module.rules.map((rule) => {
      if (
        typeof rule.test !== "undefined" ||
        typeof rule.oneOf === "undefined"
      ) {
        return rule;
      }

      rule.oneOf.unshift({
        test: /.mdx$/,
        use: [
          "babel-loader",
          {
            loader: "@mdx-js/loader",
            options: {
              remarkPlugins: [
                slug,
                [
                  headings,
                  {
                    behavior: "wrap",
                  },
                ],
              ],
            },
          },
        ],
      });

      return rule;
    });

    return config;
  },
});
