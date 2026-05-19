// AdminPage.tsx
// macOS "System Settings"-style window: a sidebar of section icons on the
// left, a content panel on the right. Each section owns its own form + list.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  FolderGit2,
  GraduationCap,
  Heart,
  LogOut,
  Sparkles,
  User,
} from 'lucide-react';
import { useAuth } from '@/services/auth';
import { Wallpaper } from '@/components/macos/Wallpaper';
import { MenuBar } from '@/components/macos/MenuBar';
import { TrafficLights } from '@/components/macos/TrafficLights';
import { ProfileSection } from '@/features/admin/sections/ProfileSection';
import { ExperienceSection } from '@/features/admin/sections/ExperienceSection';
import { ProjectSection } from '@/features/admin/sections/ProjectSection';
import { SkillSection } from '@/features/admin/sections/SkillSection';
import { EducationSection } from '@/features/admin/sections/EducationSection';
import { InterestSection } from '@/features/admin/sections/InterestSection';
import { CvSection } from '@/features/admin/sections/CvSection';
import type { ComponentType } from 'react';

type SectionId = 'profile' | 'experience' | 'projects' | 'skills' | 'education' | 'interests' | 'cv';

type Section = {
  id: SectionId;
  label: string;
  Icon: ComponentType<{ size?: number }>;
  Body: ComponentType;
};

const SECTIONS: Section[] = [
  { id: 'profile', label: 'Profile', Icon: User, Body: ProfileSection },
  { id: 'experience', label: 'Experience', Icon: Briefcase, Body: ExperienceSection },
  { id: 'projects', label: 'Projects', Icon: FolderGit2, Body: ProjectSection },
  { id: 'skills', label: 'Skills', Icon: Sparkles, Body: SkillSection },
  { id: 'education', label: 'Education', Icon: GraduationCap, Body: EducationSection },
  { id: 'interests', label: 'Interests', Icon: Heart, Body: InterestSection },
  { id: 'cv', label: 'CV', Icon: FileText, Body: CvSection },
];

export const AdminPage = () => {
  const [active, setActive] = useState<SectionId>('profile');
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const Body = SECTIONS.find((s) => s.id === active)?.Body ?? ProfileSection;

  const onLogout = async () => {
    await logout();
    nav('/admin/login', { replace: true });
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Wallpaper />
      <MenuBar />
      <div className="absolute inset-0 pt-10 pb-6 px-4 flex items-center justify-center">
        <div
          className="w-full max-w-[1100px] h-[85vh] min-h-[560px] rounded-xl overflow-hidden flex flex-col"
          style={{
            background: 'var(--color-term-bg-translucent)',
            border: '1px solid var(--color-window-border)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.45), 0 4px 12px rgba(0,0,0,0.25)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          }}
        >
          {/* Title bar */}
          <div
            className="h-7 flex items-center px-3"
            style={{
              background: 'var(--color-window-titlebar)',
              color: 'var(--color-window-titlebar-fg)',
              borderBottom: '1px solid var(--color-window-border)',
            }}
          >
            <TrafficLights />
            <div className="flex-1 text-center text-xs font-medium">Portfolio · Settings</div>
            <div className="w-12 text-right text-[11px] opacity-70">{user?.email}</div>
          </div>

          {/* Body */}
          <div className="flex-1 min-h-0 flex" style={{ color: 'var(--color-term-fg)' }}>
            {/* Sidebar */}
            <nav
              className="w-56 flex flex-col gap-1 p-2 overflow-y-auto"
              style={{
                background: 'rgba(0,0,0,0.18)',
                borderRight: '1px solid var(--color-window-border)',
              }}
            >
              {SECTIONS.map((s) => {
                const isActive = s.id === active;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActive(s.id)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition ${
                      isActive ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded-md grid place-items-center"
                      style={{
                        background: isActive ? 'var(--color-term-prompt-path)' : 'rgba(255,255,255,0.08)',
                        color: isActive ? 'white' : 'var(--color-term-fg)',
                      }}
                    >
                      <s.Icon size={14} />
                    </span>
                    <span>{s.label}</span>
                  </button>
                );
              })}

              <div className="mt-auto pt-3">
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-white/5"
                  style={{ color: 'var(--color-term-muted)' }}
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            </nav>

            {/* Content */}
            <main className="flex-1 min-w-0 overflow-y-auto p-6">
              <Body />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};
