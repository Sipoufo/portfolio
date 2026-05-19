// api.ts
// Tiny fetch wrapper used by the whole frontend. Centralizing avoids
// scattering raw fetch calls inside components.

import type {
  Education,
  EducationInput,
  Experience,
  ExperienceInput,
  Interest,
  InterestInput,
  LoginInput,
  PortfolioBundle,
  Profile,
  ProfileInput,
  Project,
  ProjectInput,
  Skill,
  SkillInput,
} from '@portfolio/shared';

const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

const request = async <T,>(method: Method, path: string, body?: unknown): Promise<T> => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let detail: unknown = null;
    try {
      detail = await res.json();
    } catch {
      // body not JSON
    }
    const err = new Error(`${method} ${path} failed: ${res.status}`);
    (err as Error & { status?: number; detail?: unknown }).status = res.status;
    (err as Error & { status?: number; detail?: unknown }).detail = detail;
    throw err;
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
};

const get = <T,>(path: string) => request<T>('GET', path);

export const api = {
  health: () => get<{ ok: true }>('/health'),
  profile: () => get<Profile>('/profile'),
  experiences: () => get<Experience[]>('/experiences'),
  projects: () => get<Project[]>('/projects'),
  skills: () => get<Skill[]>('/skills'),
  education: () => get<Education[]>('/education'),
  interests: () => get<Interest[]>('/interests'),
  cvUrl: () => `${BASE}/cv`,

  // ── auth ────────────────────────────────────────────────────────────
  login: (input: LoginInput) => request<{ id: string; email: string }>('POST', '/auth/login', input),
  logout: () => request<{ ok: true }>('POST', '/auth/logout'),
  me: () => request<{ sub: string; email: string }>('GET', '/auth/me'),

  // ── admin ──────────────────────────────────────────────────────────
  saveProfile: (input: ProfileInput) => request<Profile>('PUT', '/admin/profile', input),

  createExperience: (input: ExperienceInput) => request<Experience>('POST', '/admin/experiences', input),
  updateExperience: (id: string, input: ExperienceInput) =>
    request<Experience>('PUT', `/admin/experiences/${id}`, input),
  deleteExperience: (id: string) => request<{ ok: true }>('DELETE', `/admin/experiences/${id}`),

  createProject: (input: ProjectInput) => request<Project>('POST', '/admin/projects', input),
  updateProject: (id: string, input: ProjectInput) =>
    request<Project>('PUT', `/admin/projects/${id}`, input),
  deleteProject: (id: string) => request<{ ok: true }>('DELETE', `/admin/projects/${id}`),

  createSkill: (input: SkillInput) => request<Skill>('POST', '/admin/skills', input),
  updateSkill: (id: string, input: SkillInput) => request<Skill>('PUT', `/admin/skills/${id}`, input),
  deleteSkill: (id: string) => request<{ ok: true }>('DELETE', `/admin/skills/${id}`),

  createEducation: (input: EducationInput) => request<Education>('POST', '/admin/education', input),
  updateEducation: (id: string, input: EducationInput) =>
    request<Education>('PUT', `/admin/education/${id}`, input),
  deleteEducation: (id: string) => request<{ ok: true }>('DELETE', `/admin/education/${id}`),

  createInterest: (input: InterestInput) => request<Interest>('POST', '/admin/interests', input),
  updateInterest: (id: string, input: InterestInput) =>
    request<Interest>('PUT', `/admin/interests/${id}`, input),
  deleteInterest: (id: string) => request<{ ok: true }>('DELETE', `/admin/interests/${id}`),

  changePassword: (current: string, next: string) =>
    request<{ ok: true }>('POST', '/admin/password', { current, next }),

  uploadCv: async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${BASE}/admin/cv`, {
      method: 'POST',
      credentials: 'include',
      body: fd,
    });
    if (!res.ok) {
      let detail: unknown = null;
      try {
        detail = await res.json();
      } catch {
        // ignore
      }
      const err = new Error(`CV upload failed: ${res.status}`);
      (err as Error & { status?: number; detail?: unknown }).status = res.status;
      (err as Error & { status?: number; detail?: unknown }).detail = detail;
      throw err;
    }
    return (await res.json()) as { ok: true; size: number; updatedAt: string };
  },
};

/**
 * Loads the full portfolio bundle in parallel.
 */
export const loadBundle = async (): Promise<PortfolioBundle> => {
  const [profile, experiences, projects, skills, education, interests] = await Promise.all([
    api.profile(),
    api.experiences(),
    api.projects(),
    api.skills(),
    api.education(),
    api.interests(),
  ]);
  return { profile, experiences, projects, skills, education, interests };
};
