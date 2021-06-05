import * as React from "react";
import { MDXProvider } from "@mdx-js/react";
import { Gist } from "mdx-embed";

const components = {
  Gist,
};

const Provider: React.FC = (props) => (
  <MDXProvider components={components}>{props.children}</MDXProvider>
);

export default Provider;
