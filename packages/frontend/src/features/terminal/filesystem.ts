// filesystem.ts
// Virtual read-only filesystem mounted at ~ (the user's home).
// Used by `ls`, `cat`, `pwd` to give the impression of a real shell.

export type VFile = { type: 'file'; render: 'about' | 'contact' | 'skills' | 'experience' | 'projects' | 'education' | 'interests' };
export type VDir = { type: 'dir'; entries: Record<string, VFile | VDir> };

export const root: VDir = {
  type: 'dir',
  entries: {
    'about.md': { type: 'file', render: 'about' },
    'contact.md': { type: 'file', render: 'contact' },
    'skills.md': { type: 'file', render: 'skills' },
    'experience.md': { type: 'file', render: 'experience' },
    'projects.md': { type: 'file', render: 'projects' },
    'education.md': { type: 'file', render: 'education' },
    'interests.md': { type: 'file', render: 'interests' },
  },
};

export const resolve = (cwd: string, target: string): VFile | VDir | null => {
  // Only ~ is supported. Strip leading ~/ or ~ to normalize.
  const cleaned = target.replace(/^~\/?/, '').replace(/^\.\//, '');
  if (!cleaned || cleaned === '~' || cleaned === '.') return root;
  const parts = cleaned.split('/').filter(Boolean);
  let node: VFile | VDir = root;
  for (const p of parts) {
    if (node.type !== 'dir') return null;
    const next: VFile | VDir | undefined = node.entries[p];
    if (!next) return null;
    node = next;
  }
  return node;
};

export const listEntries = (dir: VDir): string[] => Object.keys(dir.entries).sort();

void resolve; // re-export marker, prevents accidental tree-shake in dev
