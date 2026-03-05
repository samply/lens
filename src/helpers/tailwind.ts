import tailwindCSS from "../styles/tailwind.css?inline";

const sheet = new CSSStyleSheet();
sheet.replaceSync(tailwindCSS);

/**
 * Svelte custom element `extend` function that adopts the shared
 * Tailwind stylesheet into the component's shadow DOM.
 *
 * Usage in a component:
 *
 *   <svelte:options customElement={{ tag: "lens-foo", extend: withTailwind }} />
 *   <script lang="ts">
 *     import { withTailwind } from "../../helpers/tailwind";
 *   </script>
 *   <div class="bg-primary-500 text-white p-4">works!</div>
 */
export function withTailwind(
    Cls: CustomElementConstructor,
): CustomElementConstructor {
    const origConnected = Cls.prototype.connectedCallback;
    Cls.prototype.connectedCallback = function (this: HTMLElement) {
        origConnected?.call(this);
        if (this.shadowRoot) {
            this.shadowRoot.adoptedStyleSheets = [
                ...this.shadowRoot.adoptedStyleSheets,
                sheet,
            ];
        }
    };
    return Cls;
}
