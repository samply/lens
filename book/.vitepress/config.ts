import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "Lens",
    description:
        "A web component library for clinical data search and visualization",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: "Home", link: "/" },
            { text: "User Guide", link: "/guide/" },
            { text: "Components", link: "/components/" },
            { text: "Development", link: "/development/" },
            {
                text: "v0.7.0",
                items: [
                    {
                        text: "v0.7.0 (latest)",
                        link: "https://samply.github.io/lens/0.7.0/",
                    },
                    {
                        text: "main branch",
                        link: "https://samply.github.io/lens/main/",
                    },
                ],
            },
        ],

        sidebar: [
            {
                text: "User Guide",
                items: [
                    { text: "Introduction", link: "/guide/" },
                    {
                        text: "Creating a New Application",
                        link: "/guide/new-app",
                    },
                    { text: "The Catalogue", link: "/guide/catalogue" },
                    { text: "Querying a Backend", link: "/guide/query" },
                    { text: "Showing Results", link: "/guide/results" },
                    {
                        text: "Overwriting Styles",
                        link: "/guide/overwriting-styles",
                    },
                    { text: "Translations", link: "/guide/translations" },
                    { text: "Chart Reset Button", link: "/guide/reset-button" },
                    { text: "Facet Counts", link: "/guide/facet-counts" },
                ],
            },
            {
                text: "Development",
                items: [
                    { text: "Overview", link: "/development/" },
                    { text: "Styling", link: "/development/styling" },
                    {
                        text: "Making a Release",
                        link: "/development/releasing",
                    },
                ],
            },
            {
                text: "Components",
                items: [
                    { text: "Overview", link: "/components/" },
                    { text: "Catalogue", link: "/components/catalogue" },
                    { text: "Chart", link: "/components/chart" },
                    { text: "Info Button", link: "/components/infobutton" },
                    { text: "About Lens", link: "/components/aboutlens" },
                    {
                        text: "Search Modified Display",
                        link: "/components/modifiedsearch",
                    },
                    {
                        text: "Negotiate Button",
                        link: "/components/negotiatebutton",
                    },
                    {
                        text: "Query Explain Button",
                        link: "/components/queryexplainbutton",
                    },
                    { text: "Query Spinner", link: "/components/queryspinner" },
                    {
                        text: "Result Summary",
                        link: "/components/resultsummary",
                    },
                    { text: "Result Table", link: "/components/resulttable" },
                    { text: "Search Bar", link: "/components/searchbar" },
                    {
                        text: "Search Bar Multiple",
                        link: "/components/searchbarmulti",
                    },
                    { text: "Search Button", link: "/components/searchbutton" },
                ],
            },
            {
                text: "Release Notes",
                items: [
                    { text: "Version 0.6.5", link: "/releases/v0.6.5" },
                    { text: "Version 0.6.4", link: "/releases/v0.6.4" },
                    { text: "Version 0.6.3", link: "/releases/v0.6.3" },
                    { text: "Version 0.6.2", link: "/releases/v0.6.2" },
                    { text: "Version 0.6.1", link: "/releases/v0.6.1" },
                    { text: "Version 0.6.0", link: "/releases/v0.6.0" },
                    { text: "Version 0.5.3", link: "/releases/v0.5.3" },
                    { text: "Version 0.5.2", link: "/releases/v0.5.2" },
                    { text: "Version 0.5.1", link: "/releases/v0.5.1" },
                    { text: "Version 0.5.0", link: "/releases/v0.5.0" },
                ],
            },
        ],

        socialLinks: [
            { icon: "github", link: "https://github.com/samply/lens" },
        ],

        editLink: {
            pattern: "https://github.com/samply/lens/edit/develop/docs/:path",
        },
    },
});
