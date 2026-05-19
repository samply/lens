import tailwindCSS from "../styles/tailwind.css?inline";

// @property rules must live at the document level — they don't register
// when placed inside a shadow root's adoptedStyleSheets.
const propertyRulePattern = /@property\s[^{]+\{[^}]*\}/g;
const propertyRules = tailwindCSS.match(propertyRulePattern)?.join("\n") ?? "";
const shadowCSS = tailwindCSS.replace(propertyRulePattern, "");

if (propertyRules) {
    const docSheet = new CSSStyleSheet();
    docSheet.replaceSync(propertyRules);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, docSheet];
}

const sheet = new CSSStyleSheet();
sheet.replaceSync(shadowCSS);

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
