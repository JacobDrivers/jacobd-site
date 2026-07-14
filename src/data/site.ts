export interface Tool {
  name: string;
  desc: string;
  href: string;
  status: "Live";
  tag: string;
}

export const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Projects", href: "/projects" },
  { name: "Tools", href: "/tools" },
];

export const tools: Tool[] = [
  {
    name: "Coin & Currency Scout",
    desc: "Coin and paper-currency reference with server-cached metals prices, melt calculations, inventory tracking, and auction tools.",
    href: "/tools/coin-scout",
    status: "Live",
    tag: "Tools",
  },
  {
    name: "Tornado Sandbox",
    desc: "Interactive destruction sandbox with tornado movement, camera controls, environmental effects, and destructible scenery.",
    href: "/tools/tornado-3d",
    status: "Live",
    tag: "Game",
  },
  {
    name: "The Devourer",
    desc: "Canvas-based monster evolution game with movement, grabbing, growth, power-ups, abilities, and boss encounters.",
    href: "/tools/monster-game",
    status: "Live",
    tag: "Game",
  },
];

export const socialLinks = [
  { name: "GitHub", href: "https://github.com/JacobDrivers" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/jacobadrury/" },
];

export const links = socialLinks;

export const siteInfo = {
  title: "Jacob Drury | Tools, Projects + Experiments",
  description: "Jacob Drury builds practical tools, interactive projects, and experiments.",
  author: "Jacob Drury",
  url: "https://jacobd-site.pages.dev",
  ogImage: "/og-image.png",
};
