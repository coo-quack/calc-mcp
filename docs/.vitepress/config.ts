import { defineConfig } from "vitepress";

export default defineConfig({
	title: "Calc MCP",
	description: "21 tools for things AI is not good at",
	base: "/calc-mcp/",

	themeConfig: {
		logo: "/logo.svg",

		nav: [
			{ text: "Home", link: "/" },
			{ text: "Tools", link: "/tools" },
			{ text: "Install", link: "/install" },
			{ text: "Examples", link: "/examples" },
			{ text: "Changelog", link: "/changelog" },
		],

		sidebar: [
			{
				text: "Guide",
				items: [
					{ text: "Getting Started", link: "/" },
					{ text: "Installation", link: "/install" },
					{ text: "Examples", link: "/examples" },
				],
			},
			{
				text: "Reference",
				items: [
					{ text: "All Tools", link: "/tools" },
					{ text: "Changelog", link: "/changelog" },
				],
			},
		],

		socialLinks: [
			{ icon: "github", link: "https://github.com/coo-quack/calc-mcp" },
			{
				icon: "npm",
				link: "https://www.npmjs.com/package/@coo-quack/calc-mcp",
			},
		],

		footer: {
			message: "Released under the MIT License.",
			copyright: "Copyright © 2026 coo-quack",
		},

		search: {
			provider: "local",
		},
	},

	head: [["link", { rel: "icon", type: "image/svg+xml", href: "/calc-mcp/logo.svg" }]],
});
