// inline-assets.js
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DIST_DIR = "./demo-dist";
const HTML_PATH = join(DIST_DIR, "index.html");
let html = readFileSync(HTML_PATH, "utf8");

// Match and inline <link rel="stylesheet">
html = html.replace(
    /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+\.css)["'][^>]*>/g,
    (_, href) => {
        const cssPath = join(DIST_DIR, href.replace(/^\/+/, ""));
        const cssContent = readFileSync(cssPath, "utf8");
        return `<style>\n${cssContent}\n</style>`;
    },
);

// Match and inline <script type="module">
html = html.replace(
    /<script[^>]+type=["']module["'][^>]+src=["']([^"']+\.js)["'][^>]*><\/script>/g,
    (_, src) => {
        const jsPath = join(DIST_DIR, src.replace(/^\/+/, ""));
        const jsContent = readFileSync(jsPath, "utf8");
        return `<script type="module">\n${jsContent}\n</script>`;
    },
);

// Write back the modified HTML
writeFileSync(HTML_PATH, html, "utf8");
