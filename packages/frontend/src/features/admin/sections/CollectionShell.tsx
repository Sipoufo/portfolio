// CollectionShell.tsx
// Common scaffolding for collection editors: header with title + Add button,
// a list of items, and a slot for the form when editing.

import type { ReactNode } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Field';

type ListItemProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  onEdit: () => void;
  onDelete: () => void;
};

export const ListItem = ({ title, subtitle, onEdit, onDelete }: ListItemProps) => (
  <div
    className="flex items-start justify-between gap-3 px-3 py-2 rounded-md"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-window-border)' }}
  >
    <div className="min-w-0">
      <div className="text-sm font-medium truncate">{title}</div>
      {subtitle && (
        <div className="text-xs opacity-70 truncate" style={{ color: 'var(--color-term-muted)' }}>
          {subtitle}
        </div>
      )}
    </div>
    <div className="flex items-center gap-1">
      <Button variant="ghost" onClick={onEdit} aria-label="Edit">
        <Pencil size={14} />
      </Button>
      <Button variant="danger" onClick={onDelete} aria-label="Delete">
        <Trash2 size={14} />
      </Button>
    </div>
  </div>
);

type ShellProps = {
  title: string;
  onAdd: () => void;
  children: ReactNode;
};

export const CollectionShell = ({ title, onAdd, children }: ShellProps) => (
  <div className="flex flex-col gap-3 max-w-3xl">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Button onClick={onAdd}>
        <Plus size={14} className="inline -mt-0.5 mr-1" /> Add
      </Button>
    </div>
    {children}
  </div>
);
