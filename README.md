# Jacob Drury Tools + Projects Hub

An Astro-based hub for useful tools, projects, games, and experiments. This repository powers [jacobd-site.pages.dev](https://jacobd-site.pages.dev).

This is not the complete `jacobd.us` personal site. `jacobd.us` currently points to a separate minimal Google Sites page; any future domain or subdomain integration remains undecided.

## What is here

- **Coin & Currency Scout** — deployment-generated metals prices, melt calculators, coin and paper-currency references, local inventory tracking, and auction calculations.
- **Tornado Sandbox** — an interactive 3D destruction experiment.
- **The Devourer** — a canvas-based monster evolution game.
- **Hub pages** — a focused home page, tools directory, brief About section, and custom 404 page.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Tools, projects, experiments, and brief About content |
| `/tools/` | Directory of live tools and games |
| `/tools/coin-scout/` | Coin & Currency Scout |
| `/tools/tornado-3d/` | Tornado Sandbox |
| `/tools/monster-game/` | The Devourer |
| `/api/metals.json` | Static metals-price snapshot generated during the build |

## Stack and deployment

- [Astro](https://astro.build) for static pages and routing
- React for Coin Scout's interactive interface
- Tailwind CSS for utility styling
- Playwright for local screenshot utilities
- GitHub repository: `JacobDrivers/jacobd-site`
- Production branch: `master`
- Cloudflare Pages build command: `npm run build`
- Cloudflare Pages output directory: `dist`

Cloudflare Pages automatically builds and deploys the repository after changes are pushed to the production branch.

## Local development

Use a current Node.js LTS release and npm.

```bash
npm install
npm run dev
```

Astro prints the local development URL after startup.

Create a production build with:

```bash
npm run build
```

Preview the generated `dist` output locally with:

```bash
npm run preview
```

## Metals price snapshot

`src/pages/api/metals.json.js` is intentionally prerendered during `npm run build`. It fetches prices once and writes a static `/api/metals.json` artifact; browsers do not trigger provider requests.

The preferred provider requires this server/build-only environment variable:

```text
METALS_API_KEY
```

Cloudflare Pages stores `METALS_API_KEY` as an encrypted production build secret. For local builds, place it in an untracked `.env` file if live Metals.dev data is required:

```text
METALS_API_KEY=your_key_here
```

If the key or primary provider is unavailable, the build tries the configured backup provider and finally emits clearly labeled shared fallback values. The generated JSON includes its source, generation timestamp, and the Cloudflare commit SHA when Cloudflare provides one.

Never commit `.env` files or API keys.

## Project structure

```text
public/                 Static icons, manifest, social image, robots, and sitemap
scripts/                Local screenshot helpers
src/components/         Interactive React components
src/data/               Shared site and metals data
src/layouts/            Shared Astro document layout and metadata
src/pages/              Hub pages, tools, games, and build-time JSON route
src/styles/             Global styles and design tokens
```

## Useful commands

```bash
npm run dev
npm run build
npm run preview
npm run screenshot
npm run screenshot:coin-scout
```
