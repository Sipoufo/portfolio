// ProjectSection.tsx

import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X } from 'lucide-react';
import { projectInputSchema, type Project, type ProjectInput } from '@portfolio/shared';
import { api } from '@/services/api';
import { Button, Input, Label } from '@/components/ui/Field';
import { LocalizedField } from '@/components/ui/LocalizedField';
import { CollectionShell, ListItem } from './CollectionShell';

const empty: ProjectInput = {
  name: '',
  role: { fr: '', en: '' },
  startDate: '',
  endDate: null,
  description: { fr: '', en: '' },
  tech: [],
  links: [],
  order: 0,
};

export const ProjectSection = () => {
  const [items, setItems] = useState<Project[]>([]);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);

  const form = useForm<ProjectInput>({
    resolver: zodResolver(projectInputSchema),
    defaultValues: empty,
  });
  const links = useFieldArray({ control: form.control, name: 'links' });
  const [techCsv, setTechCsv] = useState('');

  const load = async () => setItems(await api.projects());
  useEffect(() => {
    void load();
  }, []);

  const startNew = () => {
    form.reset(empty);
    setTechCsv('');
    setEditingId('new');
  };

  const startEdit = (it: Project) => {
    form.reset({
      name: it.name,
      role: it.role,
      startDate: it.startDate,
      endDate: it.endDate,
      description: it.description,
      tech: it.tech,
      links: it.links,
      order: it.order,
    });
    setTechCsv(it.tech.join(', '));
    setEditingId(it.id);
  };

  const onSubmit = async (data: ProjectInput) => {
    const payload: ProjectInput = {
      ...data,
      tech: techCsv.split(',').map((s) => s.trim()).filter(Boolean),
    };
    if (editingId === 'new') await api.createProject(payload);
    else if (editingId) await api.updateProject(editingId, payload);
    setEditingId(null);
    await load();
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await api.deleteProject(id);
    await load();
  };

  if (editingId !== null) {
    return (
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-3xl">
        <h2 className="text-lg font-semibold">{editingId === 'new' ? 'New project' : 'Edit project'}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>Name</Label>
            <Input {...form.register('name')} />
          </div>
          <div>
            <Label>Order</Label>
            <Input type="number" {...form.register('order', { valueAsNumber: true })} />
          </div>
        </div>

        <LocalizedField label="Role" namePrefix="role" register={form.register as never} errors={form.formState.errors as never} />
        <LocalizedField label="Description" namePrefix="description" register={form.register as never} errors={form.formState.errors as never} multiline />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label hint="YYYY-MM">Start date</Label>
            <Input {...form.register('startDate')} placeholder="2024-01" />
          </div>
          <div>
            <Label hint="YYYY-MM">End date</Label>
            <Input {...form.register('endDate')} placeholder="2025-06" />
          </div>
        </div>

        <div>
          <Label hint="comma-separated">Tech</Label>
          <Input value={techCsv} onChange={(e) => setTechCsv(e.target.value)} />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label>Links</Label>
            <Button variant="ghost" onClick={() => links.append({ label: '', url: '' })}>
              <Plus size={12} className="inline -mt-0.5 mr-1" /> Add link
            </Button>
          </div>
          {links.fields.map((f, i) => (
            <div key={f.id} className="flex items-start gap-2">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Input {...form.register(`links.${i}.label`)} placeholder="Label" />
                <Input {...form.register(`links.${i}.url`)} placeholder="https://…" />
              </div>
              <Button variant="danger" onClick={() => links.remove(i)} aria-label="Remove">
                <X size={14} />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button type="submit">Save</Button>
          <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
        </div>
      </form>
    );
  }

  return (
    <CollectionShell title="Projects" onAdd={startNew}>
      <div className="flex flex-col gap-2">
        {items.map((it) => (
          <ListItem
            key={it.id}
            title={`${it.name} — ${it.role.fr}`}
            subtitle={`${it.startDate} → ${it.endDate ?? 'present'} · ${it.tech.join(', ')}`}
            onEdit={() => startEdit(it)}
            onDelete={() => onDelete(it.id)}
          />
        ))}
        {items.length === 0 && <div className="text-sm opacity-70">No project yet.</div>}
      </div>
    </CollectionShell>
  );
};
