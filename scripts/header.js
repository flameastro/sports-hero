import { LitElement, html, css } from "https://esm.sh/lit";

export class TopAppBar extends LitElement {
  static properties = {
    title: { type: String },
    titleNav: { type: String, attribute: 'title-nav' },
    isMenuOpen: { type: Boolean, state: true },
    isHidden: { type: Boolean, state: true },
    isScrolled: { type: Boolean, state: true },
    activeIndex: { type: Number, state: true },
    _items: { type: Array, state: true }
  };

  static styles = css`
    :host {
      /* M3 Color System Tokens */
      --md-sys-color-surface: #fef7ff;
      --md-sys-color-on-surface: #1d1b20;
      --md-sys-color-on-surface-variant: #49454f;
      --md-sys-color-surface-container: #f3edf7;
      --md-sys-color-primary-container: #eaddff;
      --md-sys-color-on-primary-container: #21005d;
      
      /* M3 Emphasized Motion Tokens */
      --md-sys-motion-easing-emphasized: cubic-bezier(0.2, 0, 0, 1);
      --md-sys-motion-duration-long2: 500ms;
      --md-sys-motion-duration-short4: 200ms;

      font-family: Roboto, system-ui, sans-serif;
    }

    /* M3 Top App Bar Spec (Height: 64px) */
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
      background-color: var(--color-amber-500); /* Background do Header */
      color: var(--md-sys-color-on-surface);
      z-index: 100;
      box-sizing: border-box;
      
      /* Animação Suave com Transform para o Hide on Scroll */
      will-change: transform;
      transition: transform var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized),
                  background-color var(--md-sys-motion-duration-short4) linear,
                  box-shadow var(--md-sys-motion-duration-short4) linear;
    }

    .header.hidden {
      transform: translateY(-100%);
    }

    /* M3 Elevation via Box-Shadow no estado Scrolled */
    .header.scrolled {
      box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.15), 
                  0px 1px 2px 0px rgba(0, 0, 0, 0.30);
      background-color: var(--md-sys-color-surface-container);
    }

    .title {
      font-size: 22px;
      font-weight: 400;
      line-height: 28px;
    }

    /* Menu Hambúrguer alinhado à direita no final */
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

    /* Overlay Real que bloqueia interações traseiras */
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.4);
      z-index: 199;
      opacity: 0;
      pointer-events: none;
      will-change: opacity;
      transition: opacity var(--md-sys-motion-duration-long2) var(--md-sys-motion-easing-emphasized);
    }

    .overlay.open {
      opacity: 1;
      pointer-events: auto;
    }

    /* M3 Modal Navigation Drawer (Esquerdo, Largura: 360dp, Cantos: 0 16dp 16dp 0) */
    .drawer {
      position: fixed;
      top: 0;
      left: 0;
      width: 360px;
      max-width: 85vw;
      height: 100vh;
      background: var(--md-sys-color-surface);
      z-index: 200;
      box-sizing: border-box;
      border-radius: 0 16px 16px 0; 
      overflow: hidden;
      display: flex;
      flex-direction: column;
      
      /* Animação com Transform Otimizado e Suave */
      will-change: transform;
      transform: translateX(-100%);
      transition: transform var(--md-sys-motion-duration-long2) var(--md-sys-motion-easing-emphasized);
      box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.15), 
                  0px 8px 12px 6px rgba(0, 0, 0, 0.15);
    }

    .drawer.open {
      transform: translateX(0);
    }

    /* M3 Header Drawer Typography & Padding */
    .drawer-header {
      padding: 24px 24px 16px 28px;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.1px;
      color: var(--md-sys-color-on-surface-variant);
    }

    /* Layout da Lista M3 - Itens não encostam nas bordas (Padding horizontal de 12dp) */
    md-list {
      background: transparent;
      padding: 12px;
      overflow-y: auto;
    }

    /* M3 Navigation Drawer Item Spec (Height: 56dp, Shape: 28dp pill) */
    md-list-item {
      position:relative;
      overflow:hidden;
      cursor: pointer;
      height: 56px;
      margin-bottom: 4px;
      border-radius: 28px;
      display:flex;
      align-items:center;
      justify-content:center;
      
      /* Sobrescrita de Variáveis Locais do Componente M3 Web */
      --md-list-item-container-shape: 28px;
      --md-list-item-label-text-size: 14px;
      --md-list-item-label-text-weight: 500;
      --md-list-item-label-text-color: var(--md-sys-color-on-surface-variant);
    }

    /* Estado Ativo Persistente M3 */
    md-list-item.active {
      background-color: var(--md-sys-color-primary-container);
      --md-list-item-label-text-color: var(--md-sys-color-on-primary-container);
    }

    /* Esconde a projeção original do slot do DOM real */
    slot[name="item"] {
      display: none;
    }
  `;

  constructor() {
    super();
    this.title = 'App';
    this.titleNav = 'Navigation';
    this.isMenuOpen = false;
    this.isHidden = false;
    this.isScrolled = false;
    this.activeIndex = 0;
    this._items = [];
    this.lastScrollY = window.scrollY;

    this._handleScroll = this._handleScroll.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('scroll', this._handleScroll, { passive: true });
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this._handleScroll);
    super.disconnectedCallback();
  }

  _handleSlotChange(e) {
    const slot = e.target;
    const assigned = slot.assignedNodes({ flatten: true })
      .filter(node => node.nodeType === Node.ELEMENT_NODE);
    this._items = assigned.map(node => node.textContent.trim());
  }

  _handleScroll() {
    const currentScrollY = window.scrollY;
    
    // Controle da Elevação (Ativada se scroll > 10px)
    this.isScrolled = currentScrollY > 10;

    // Hid on Scroll via Transform
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
    this.activeIndex = index;
    this.dispatchEvent(new CustomEvent('nav-change', { 
      detail: { index, item: this._items[index] },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <!-- Header Principal -->
      <header class="header ${this.isHidden ? 'hidden' : ''} ${this.isScrolled ? 'scrolled' : ''}">
        <div class="title">${this.title}</div>
        <div class="menu-trigger" @click=${this._toggleMenu}>
          <slot name="trigger"></slot>
          <md-ripple></md-ripple>
        </div>
      </header>

      <!-- Slot oculto dos elementos HTML reais -->
      <slot name="item" @slotchange=${this._handleSlotChange}></slot>

      <!-- Overlay Real Interativo (Bloqueia cliques traseiros) -->
      <div class="overlay ${this.isMenuOpen ? 'open' : ''}" @click=${this._toggleMenu}></div>

      <!-- OffCanvas Menu Lateral Esquerdo M3 -->
      <nav class="drawer ${this.isMenuOpen ? 'open' : ''}">
        <div class="drawer-header">${this.titleNav}</div>
        <md-divider></md-divider>
        
        <md-list>
          ${this._items.map((item, index) => html`
            <md-list-item 
              class=${this.activeIndex === index ? 'active' : ''} 
              @click=${() => this._selectItem(index)}
            >
              <div slot="headline">${item}</div>
              <md-ripple></md-ripple>
            </md-list-item>
          `)}
        </md-list>
      </nav>
    `;
  }
}
customElements.define('top-app-bar', TopAppBar);