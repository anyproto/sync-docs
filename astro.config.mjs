// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	// Canonical site URL — used for canonical links and the sitemap.
	site: 'https://sync.any.org',
	integrations: [
		starlight({
			title: 'any-sync',
			description:
				'any-sync — an open-source protocol for high-speed, peer-to-peer synchronization of encrypted, user-owned channels.',
			logo: {
				src: './src/assets/logo-square.png',
				alt: 'ANY',
				// Show the "any-sync" wordmark next to the square logo (GitBook-style).
				replacesTitle: false,
			},
			favicon: '/favicon.png',
			// GitBook-style code blocks: rounded, hairline border, JetBrains Mono.
			expressiveCode: {
				themes: ['github-dark-default'],
				styleOverrides: {
					borderRadius: '0.5rem',
					borderColor: 'var(--sl-color-hairline-light)',
					codeFontFamily: "'JetBrains Mono Variable', ui-monospace, monospace",
				},
			},
			customCss: [
				// Self-hosted fonts (no external CDN — on-brand for a privacy protocol).
				'@fontsource-variable/hanken-grotesk',
				'@fontsource-variable/jetbrains-mono',
				'./src/styles/custom.css',
			],
			// Dark-only: force the dark theme and drop the light/dark toggle.
			components: {
				ThemeProvider: './src/components/ThemeProvider.astro',
				ThemeSelect: './src/components/ThemeSelect.astro',
			},
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/anyproto/any-sync',
				},
			],
			// Flat sidebar mirroring the original GitBook SUMMARY.md order.
			sidebar: [
				{ label: 'Overview', link: '/' },
				{ label: 'Concepts', link: '/concepts/' },
				{ label: 'Access control and Encryption', link: '/access-control/' },
				{ label: 'Networking and Infrastructure', link: '/networking/' },
				{ label: 'Future work', link: '/future-work/' },
			],
		}),
	],
});
