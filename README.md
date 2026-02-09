# Jacob's Site

A personal website featuring various tools and information. This site combines useful utilities with personal content and projects.

## Features

- **CoinScout Tool**: Interactive tool for researching and identifying collectible coins with detailed information on coin types, key dates, varieties, and grading guidance
- **Personal Profile**: Information and projects about me
- **Multiple Tools**: A growing collection of useful utilities and interactive tools
- **Clean, Modern Design**: Built with Astro and React for fast, responsive performance

## Project Structure

```text
/
├── public/
├── src
│   ├── assets/
│   ├── components/
│   │   └── CoinScout.jsx
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   └── tools/
│   │       └── coin-scout.astro
│   └── styles/
│       └── global.css
└── package.json
```

## Commands

All commands are run from the root of the project, from a terminal:

| Command       | Action                                    |
| :------------ | :---------------------------------------- |
| npm install   | Installs dependencies                     |
| npm run dev   | Starts local dev server at localhost:4321 |
| npm run build | Build your production site to ./dist/      |
| npm run preview | Preview your build locally              |

## Technology Stack

- **Astro** - Static site generator
- **React** - Interactive components
- **Tailwind CSS** - Styling
- **Lucide React** - Icons