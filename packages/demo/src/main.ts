/**
 * comment in for npm package usage
 */
// import "@samply/lens";

import "../../lib";

import "./ccp.css";
import App from "./AppCCP.svelte";

const app = new App({
    target: document.getElementById("app") as HTMLElement,
});

export default app;
