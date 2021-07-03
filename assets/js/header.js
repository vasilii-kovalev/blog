"use strict";

const headerTemplate = document.createElement("template");
headerTemplate.innerHTML = `
<header>
  <nav>
    <ul>
      <li><a href="about.html">About</a></li>
    </ul>
  </nav>
</header>
`;

class Header extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: "closed" });

    shadowRoot.appendChild(headerTemplate.content);
  }
}

customElements.define("header-component", Header);
