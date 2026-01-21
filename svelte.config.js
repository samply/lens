import adapter from "@sveltejs/adapter-static";

export default {
    kit: {
        adapter: adapter({
            // Build the demo site to the 'demo' folder
            pages: "demo",
            assets: "demo",
            fallback: "index.html",
        }),
    },
    compilerOptions: {
        // Force all components into Svelte 5 mode and make Svelte 4 syntax unavailable.
        // This will probably become the default at some point and then we can remove this.
        runes: true,
    },
};
