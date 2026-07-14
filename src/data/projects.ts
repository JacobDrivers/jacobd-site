export interface Project {
  name: string;
  summary: string;
  href: string;
  type: string;
  status: "Live";
  technologies: string[];
  featured?: boolean;
}

export const projects: Project[] = [
  {
    name: "Coin & Currency Scout",
    summary:
      "A practical coin and paper-currency reference with live server-cached metals prices, melt calculations, inventory tracking, and auction tools.",
    href: "/tools/coin-scout",
    type: "Tool",
    status: "Live",
    technologies: ["Astro", "React", "Tailwind CSS", "Cloudflare Pages Functions", "Workers KV"],
    featured: true,
  },
  {
    name: "Tornado Sandbox",
    summary:
      "An interactive destruction sandbox focused on movement, camera control, environmental effects, and immediate visual feedback.",
    href: "/tools/tornado-3d",
    type: "Interactive experiment",
    status: "Live",
    technologies: ["Astro", "JavaScript", "Canvas"],
    featured: true,
  },
  {
    name: "The Devourer",
    summary:
      "A canvas-based monster evolution game with movement, grabbing, growth, power-ups, abilities, and boss encounters.",
    href: "/tools/monster-game",
    type: "Game experiment",
    status: "Live",
    technologies: ["Astro", "JavaScript", "Canvas"],
  },
];
