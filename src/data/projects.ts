export interface Project {
  slug: string;
  name: string;
  summary: string;
  href: string;
  type: string;
  status: "Live";
  technologies: string[];
  problem: string;
  highlights: string[];
  featured?: boolean;
}

export const projects: Project[] = [
  {
    slug: "coin-scout",
    name: "Coin & Currency Scout",
    summary:
      "A practical coin and paper-currency reference with live server-cached metals prices, melt calculations, inventory tracking, and auction tools.",
    href: "/tools/coin-scout",
    type: "Tool",
    status: "Live",
    technologies: ["Astro", "React", "Tailwind CSS", "Cloudflare Pages Functions", "Workers KV"],
    problem: "I wanted a faster way to identify coins, estimate melt value, track inventory, and make better decisions at home or during an auction.",
    highlights: [
      "Live metals pricing with a server-side cache and fallback states",
      "Melt calculations for common silver coin types",
      "Coin and paper-currency reference views",
      "Browser-local inventory tracking and auction calculations",
    ],
    featured: true,
  },
  {
    slug: "tornado-sandbox",
    name: "Tornado Sandbox",
    summary:
      "An interactive destruction sandbox focused on movement, camera control, environmental effects, and immediate visual feedback. Requires keyboard and mouse.",
    href: "/tools/tornado-3d",
    type: "Interactive experiment",
    status: "Live",
    technologies: ["Astro", "JavaScript", "Canvas"],
    problem: "I wanted a focused experiment where movement, camera control, destruction, and environmental effects could be tested together in an immediate visual space.",
    highlights: [
      "Interactive tornado movement across a destructible landscape",
      "Orbit and zoom camera controls",
      "Particles, rain, lighting, debris, and destruction effects",
      "Visible fallback messaging when WebGL or the 3D runtime is unavailable",
    ],
    featured: true,
  },
  {
    slug: "the-devourer",
    name: "The Devourer",
    summary:
      "A canvas-based monster evolution game with movement, grabbing, growth, power-ups, abilities, and boss encounters. Desktop recommended; basic touch controls are available.",
    href: "/tools/monster-game",
    type: "Game experiment",
    status: "Live",
    technologies: ["Astro", "JavaScript", "Canvas"],
    problem: "I wanted to explore a small game system built around movement, grabbing, growth, and increasingly powerful abilities.",
    highlights: [
      "Canvas-based movement across floors, walls, and ceilings",
      "Tentacle targeting and grabbing mechanics",
      "Biomass growth, additional tentacles, particles, and fleeing characters",
      "Desktop controls with basic touch movement and grabbing",
    ],
  },
];
