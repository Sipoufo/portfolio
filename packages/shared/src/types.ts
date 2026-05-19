// types.ts
// Domain types shared between frontend and backend.

export type Lang = 'fr' | 'en';

export type LocalizedString = {
  fr: string;
  en: string;
};

export type Social = {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
};

export type Profile = {
  id: string;
  name: string;
  title: LocalizedString;
  summary: LocalizedString;
  email: string;
  phone?: string;
  location: LocalizedString;
  socials: Social;
  updatedAt: string;
};

export type Experience = {
  id: string;
  company: string;
  role: LocalizedString;
  location: LocalizedString;
  startDate: string;
  endDate: string | null;
  current: boolean;
  bullets: LocalizedString[];
  tech: string[];
  order: number;
};

export type Project = {
  id: string;
  name: string;
  role: LocalizedString;
  startDate: string;
  endDate: string | null;
  description: LocalizedString;
  tech: string[];
  links: { label: string; url: string }[];
  order: number;
};

export type SkillCategory =
  | 'mobile'
  | 'backend'
  | 'frontend'
  | 'database'
  | 'devops'
  | 'management'
  | 'language';

export type Skill = {
  id: string;
  category: SkillCategory;
  name: string;
  level?: number;
  order: number;
};

export type Education = {
  id: string;
  school: string;
  degree: LocalizedString;
  startDate: string;
  endDate: string | null;
  location: LocalizedString;
  order: number;
};

export type Interest = {
  id: string;
  label: LocalizedString;
  order: number;
};

export type PortfolioBundle = {
  profile: Profile;
  experiences: Experience[];
  projects: Project[];
  skills: Skill[];
  education: Education[];
  interests: Interest[];
};
