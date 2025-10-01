// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Documentação Inovacamp QI Tech",
  tagline: "Construindo o futuro da inovação financeira",
  favicon: "img/favicon.ico",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://thiagomes07.github.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/inovacamp/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "thiagomes07", // Usually your GitHub org/user name.
  projectName: "inovacamp", // Usually your repo name.

  onBrokenLinks: "throw",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "pt-BR",
    locales: ["pt-BR"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: "./sidebars.js",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/thiagomes07/inovacamp/pulls",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "img/docusaurus-social-card.jpg",
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: "Inovacamp QI Tech",
        items: [
          {
            type: "docSidebar",
            sidebarId: "docsSidebar",
            position: "left",
            label: "Documentação",
          },
          {
            href: "https://github.com/thiagomes07/inovacamp",
            label: "Código Fonte",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        copyright: `
          Feito por <a href="https://www.linkedin.com/in/henrique-botti-6272571a0/" target="_blank" rel="noopener noreferrer">Henrique Botti</a>, 
          <a href="https://www.linkedin.com/in/gabriel-martins-alves/" target="_blank" rel="noopener noreferrer">Gabriel Martins</a> e 
          <a href="https://www.linkedin.com/in/thiagogomesalmeida/" target="_blank" rel="noopener noreferrer">Thiago Gomes</a>. 
          Para a o Hackathon: <a href="https://www.inovacamp-qitech.com.br/" target="_blank" rel="noopener noreferrer">InovaCamp QI Tech</a>. 
          © ${new Date().getFullYear()} <nome_da_solucao>, Inc. Built with Docusaurus.
        `,
      },

      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
