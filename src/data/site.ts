export interface Tool {
  name: string;
  desc: string;
  href: string;
  status: "Live" | "Soon";
  tag: string;
  disabled?: boolean;
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
    desc: "Spot prices, melt calculator, key dates, and inventory. Built for quick decisions at home or at auctions.",
    href: "/tools/coin-scout",
    status: "Live",
    tag: "Tools",
  },
  {
    name: "Tornado Sandbox",
    desc: "Control a massive tornado and destroy everything in your path. Pure destruction sandbox with spectacular effects.",
    href: "/tools/tornado-3d",
    status: "Live",
    tag: "Game",
  },
  {
    name: "The Devourer",
    desc: "A visceral monster evolution game. Consume, grow, and dominate. Features boss battles, power-ups, and abilities.",
    href: "/tools/monster-game",
    status: "Live",
    tag: "Game",
  },
  {
    name: "Coin Library (coming soon)",
    desc: "Quick reference for types, compositions, key dates, and red flags.",
    href: "/tools",
    status: "Soon",
    tag: "Reference",
    disabled: true,
  },
  {
    name: "Auction Mode (coming soon)",
    desc: "Fast entry, totals, targets, and sanity checks while bidding.",
    href: "/tools",
    status: "Soon",
    tag: "Workflow",
    disabled: true,
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
