import React from "react";
import { useScrollToAnchor } from "hooks/useScrollToAnchor";

export default () => {
  useScrollToAnchor();

  return (
    <>
      <h1 id="top">Top</h1>
      <a href="about#bottom">To bottom</a>
      <p>React Static is a progressive static site generator for React.</p>
      <div style={{ height: 1500, width: 1500 }}></div>
      <h2 id="bottom">Bottom</h2>
      <a href="about#top">To top</a>
    </>
  );
};
