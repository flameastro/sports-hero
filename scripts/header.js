import { LitElement, html, css } from "https://esm.sh/lit";

export class TopAppBar extends LitElement {
  static properties = {
    title: { type: String },
    titleNav: { type: String, attribute: "title-nav" },
    isMenuOpen: { type: Boolean, state: true },
    isHidden: { type: Boolean, state: true },
    isScrolled: { type: Boolean, state: true },
    activeIndex: { type: Number, state: true },
    _items: { type: Array, state: true }
  };

  static styles = css`
    :host {
      --md-sys-color-surface: #fef7ff;
      --md-sys-color-on-surface: #1d1b20;
      --md-sys-color-on-surface-variant: #49454f;
      --md-sys-color-surface-container: #f3edf7;
      --md-sys-color-primary-container: #eaddff;
      --md-sys-color-on-primary-container: #21005d;

      --md-sys-motion-easing-emphasized: cubic-bezier(0.2, 0, 0, 1);
      --md-sys-motion-duration-long2: 500ms;
      --md-sys-motion-duration-short4: 200ms;

      font-family: Roboto, system-ui, sans-serif;
    }

    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      background-color: var(--color-amber-500);
      color: var(--md-sys-color-on-surface);
      z-index: 100;
      box-sizing: border-box;
      will-change: transform;
      transition:
        transform var(--md-sys-motion-duration-short4)
          var(--md-sys-motion-easing-emphasized),
        background-color var(--md-sys-motion-duration-short4) linear,
        box-shadow var(--md-sys-motion-duration-short4) linear;
    }

    .header.hidden {
      transform: translateY(-100%);
    }

    .header.scrolled {
      box-shadow:
        0px 1px 3px 1px rgba(0, 0, 0, 0.15),
        0px 1px 2px 0px rgba(0, 0, 0, 0.3);
      background-color: var(--md-sys-color-surface-container);
    }

    .title {
      font-size: 22px;
      font-weight: 400;
      line-height: 28px;
    }

    .menu-trigger {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      position: relative;
    }

    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 199;
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--md-sys-motion-duration-long2)
        var(--md-sys-motion-easing-emphasized);
    }

    .overlay.open {
      opacity: 1;
      pointer-events: auto;
    }

    .drawer {
      position: fixed;
      top: 0;
      left: 0;
      width: 360px;
      max-width: 85vw;
      height: 100vh;
      background: var(--color-orange-50);
      z-index: 200;
      border-radius: 0 16px 16px 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transform: translateX(-100%);
      transition: transform var(--md-sys-motion-duration-long2)
        var(--md-sys-motion-easing-emphasized);
      box-shadow:
        0px 1px 3px 1px rgba(0, 0, 0, 0.15),
        0px 8px 12px 6px rgba(0, 0, 0, 0.15);
    }

    .drawer.open {
      transform: translateX(0);
    }

    .drawer-header {
      padding: 24px 24px 16px 28px;
      font-size: 14px;
      font-weight: 500;
      color: var(--md-sys-color-on-surface-variant);
    }

    md-list {
      background: transparent;
      padding: 12px;
      overflow-y: auto;
    }

    md-list-item {
      position: relative;
      overflow: hidden;
      cursor: pointer;
      height: 56px;
      margin-bottom: 4px;
      border-radius: 28px;
      display: flex;
      align-items: center;
      justify-content: center;

      --md-list-item-container-shape: 28px;
      --md-list-item-label-text-size: 14px;
      --md-list-item-label-text-weight: 500;
      --md-list-item-label-text-color: var(
        --md-sys-color-on-surface-variant
      );
    }

    md-list-item.active {
      background: var(--color-red-500);
      --md-list-item-label-text-color: var(
        --md-sys-color-on-primary-container
      );
    }

    slot[name="item"] {
      display: none;
    }
  `;

  constructor() {
    super();

    this.title = "App";
    this.titleNav = "Navigation";

    this.isMenuOpen = false;
    this.isHidden = false;
    this.isScrolled = false;

    this.activeIndex = -1;
    this._items = [];

    this.lastScrollY = window.scrollY;

    this._handleScroll = this._handleScroll.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();

    window.addEventListener("scroll", this._handleScroll, {
      passive: true
    });
  }

  disconnectedCallback() {
    window.removeEventListener("scroll", this._handleScroll);
    super.disconnectedCallback();
  }

  _handleSlotChange(e) {
    const assigned = e.target.assignedElements({ flatten: true });

    this._items = assigned.map((el) => ({
      label: el.textContent.trim(),
      href: el.getAttribute("href") || "#"
    }));

    const path = location.pathname;

    this.activeIndex = this._items.findIndex((item) => {
      if (item.href === "/index.html" || item.href === "index.html") {
        return (
          path.endsWith("/index.html") ||
          path === "/" ||
          path.endsWith("/")
        );
      }

      return path.endsWith(item.href);
    });
  }

  _handleScroll() {
    const currentScrollY = window.scrollY;

    this.isScrolled = currentScrollY > 10;

    if (currentScrollY > this.lastScrollY && currentScrollY > 64) {
      this.isHidden = true;
    } else {
      this.isHidden = false;
    }

    this.lastScrollY = currentScrollY;
  }

  _toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  _selectItem(index) {
    const item = this._items[index];

    this.activeIndex = index;
    this.isMenuOpen = false;

    window.location.href = item.href;
  }

    render() {
    return html`
      <!-- Header -->
      <header
        class="header ${this.isHidden ? "hidden" : ""} ${this.isScrolled
          ? "scrolled"
          : ""}"
      >
        <div class="title">${this.title}</div>

        <div class="menu-trigger" @click=${this._toggleMenu}>
          <slot name="trigger"></slot>
          <md-ripple></md-ripple>
        </div>
      </header>

      <!-- Slot oculto -->
      <slot
        name="item"
        @slotchange=${this._handleSlotChange}
      ></slot>

      <!-- Overlay -->
      <div
        class="overlay ${this.isMenuOpen ? "open" : ""}"
        @click=${this._toggleMenu}
      ></div>

      <!-- Drawer -->
      <nav class="drawer ${this.isMenuOpen ? "open" : ""}">
        <div class="drawer-header">
          ${this.titleNav}
        </div>

        <md-divider></md-divider>

        <md-list>
          ${this._items.map(
            (item, index) => html`
              <md-list-item
                class=${this.activeIndex === index ? "active" : ""}
                @click=${() => this._selectItem(index)}
              >
                <div slot="headline">
                  ${item.label}
                </div>

                <md-ripple></md-ripple>
              </md-list-item>
            `
          )}
        </md-list>
      </nav>
    `;
  }
}

customElements.define("top-app-bar", TopAppBar);