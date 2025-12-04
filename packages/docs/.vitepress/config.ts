import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "PremiAnno",
  description: "A Premiere Pro UXP Plugin for Dataset Annotation",
  base: "/premianno/",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/getting-started" },
      { text: "API", link: "/api/" },
    ],

    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "What is PremiAnno?", link: "/guide/introduction" },
          { text: "Getting Started", link: "/guide/getting-started" },
        ],
      },
      {
        text: "Guide",
        items: [
          { text: "Installation", link: "/guide/installation" },
          { text: "Usage", link: "/guide/usage" },
          { text: "Development", link: "/guide/development" },
        ],
      },
      {
        text: "API Reference",
        items: [{ text: "Overview", link: "/api/" }],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/rmuraix/premianno" },
    ],

    footer: {
      message: "Released under the ISC License.",
      copyright: "Copyright © 2025-present rmuraix",
    },
  },
});
