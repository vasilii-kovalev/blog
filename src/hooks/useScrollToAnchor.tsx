import * as React from "react";

const useScrollToAnchor = (): null => {
  // For unknown reason "window" can't be used (a ReferenceError occurs).
  const { location } = global.window ?? {
    location: {
      hash: "",
    },
  };

  React.useLayoutEffect(() => {
    // Inspired by: https://stackoverflow.com/a/59128204/11293963
    const hash = location.hash;
    // '#element-id' -> 'element-id'
    const id = hash.substr(1);
    const element = id ? document.getElementById(id) : null;

    if (element) {
      element.scrollIntoView();
    }
  }, [location.hash]);

  return null;
};

export { useScrollToAnchor };
