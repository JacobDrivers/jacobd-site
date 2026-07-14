export interface ResumeEntry {
  organization: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  highlights: string[];
}

export interface EducationEntry {
  institution: string;
  credential: string;
  field?: string;
  start?: string;
  end?: string;
}

export const resume = {
  summary:
    "I build tools to solve real problems, then refine them into focused experiences that are clear, fast, and practical.",
  experience: [] as ResumeEntry[],
  education: [] as EducationEntry[],
  certifications: [] as string[],
  skills: [
    {
      category: "Demonstrated in this repository",
      items: [
        "Astro",
        "React",
        "JavaScript",
        "Tailwind CSS",
        "Cloudflare Pages",
        "Workers KV",
        "Playwright",
        "Git and GitHub",
      ],
    },
  ],
};

export const resumeTodos = [
  "Add a verified professional title and summary.",
  "Add employment history: organization, title, dates, optional public location, and approved highlights.",
  "Add education: institution, credential or program, field, and dates you want published.",
  "Add verified certifications, awards, publications, or public service work, if applicable.",
  "Review the demonstrated technologies and confirm how they should be represented as professional skills.",
  "Confirm the preferred public contact method for the print version.",
];
