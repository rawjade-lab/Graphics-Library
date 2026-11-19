export interface ProjectSection {
  heading: string;
  content: string;
  imageUrl?: string;
  codeSnippet?: string;
}

export interface ProjectItem {
  id: string;
  bookId: string;
  chapterNumber: string;
  title: string;
  subtitle: string;
  subCategory: string;
  tags: string[];
  period: string;
  role: string;
  thumbnailUrl: string;
  liveUrl?: string;
  githubUrl?: string;
  overview: string;
  troubleshooting: {
    problem: string;
    solution: string;
  }[];
  sections: ProjectSection[];
  outcome: string;
}

export interface BookCategory {
  id: string;
  spineTitle: string;
  coverTitle: string;
  coverSubtitle: string;
  categoryLabel: string;
  color: string;
  accentColor: string;
  thickness: number;
  tiltAngle?: number;
  fontStyle?: "sans" | "serif";
  fontUrl?: string;
  tiltAngle?: number;
  fontStyle?: "sans" | "serif";
  height: number;
  subCategories: string[];
}