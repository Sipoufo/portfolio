// ExperienceSection.tsx

import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X } from 'lucide-react';
import { experienceInputSchema, type Experience, type ExperienceInput } from '@portfolio/shared';
import { api } from '@/services/api';
import { Button, Input, Label } from '@/components/ui/Field';
import { LocalizedField } from '@/components/ui/LocalizedField';
import { CollectionShell, ListItem } from './CollectionShell';

const empty: ExperienceInput = {
  company: '',
  role: { fr: '', en: '' },
  location: { fr: '', en: '' },
  startDate: '',
  endDate: null,
  current: false,
  bullets: [],
  tech: [],
  order: 0,
};

export const ExperienceSection = () => {
  const [items, setItems] = useState<Experience[]>([]);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);

  const form = useForm<ExperienceInput>({
    resolver: zodResolver(experienceInputSchema),
    defaultValues: empty,
  });

  const bullets = useFieldArray({ control: form.control, name: 'bullets' });
  const [techCsv, setTechCsv] = useState('');

  const load = async () => setItems(await api.experiences());
  useEffect(() => {
    void load();
  }, []);

  const startNew = () => {
    form.reset(empty);
    setTechCsv('');
    setEditingId('new');
  };

  const startEdit = (it: Experience) => {
    form.reset({
      company: it.company,
      role: it.role,
      location: it.location,
      startDate: it.startDate,
      endDate: it.endDate,
      current: it.current,
      bullets: it.bullets,
      tech: it.tech,
      order: it.order,
    });
    setTechCsv(it.tech.join(', '));
    setEditingId(it.id);
  };

  const onSubmit = async (data: ExperienceInput) => {
    const payload: ExperienceInput = {
      ...data,
      tech: techCsv.split(',').map((s) => s.trim()).filter(Boolean),
      endDate: data.current ? null : data.endDate ?? null,
    };
    if (editingId === 'new') await api.createExperience(payload);
    else if (editingId) await api.updateExperience(editingId, payload);
    setEditingId(null);
    await load();
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this experience?')) return;
    await api.deleteExperience(id);
    await load();
  };

  if (editingId !== null) {
    return (
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-3xl">
        <h2 className="text-lg font-semibold">{editingId === 'new' ? 'New experience' : 'Edit experience'}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>Company</Label>
            <Input {...form.register('company')} error={form.formState.errors.company?.message} />
          </div>
          <div>
            <Label>Order</Label>
            <Input type="number" {...form.register('order', { valueAsNumber: true })} />
          </div>
        </div>

        <LocalizedField label="Role" namePrefix="role" register={form.register as never} errors={form.formState.errors as never} />
        <LocalizedField label="Location" namePrefix="location" register={form.register as never} errors={form.formState.errors as never} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label hint="YYYY-MM">Start date</Label>
            <Input {...form.register('startDate')} placeholder="2024-01" error={form.formState.errors.startDate?.message} />
          </div>
          <div>
            <Label hint="YYYY-MM">End date</Label>
            <Input {...form.register('endDate')} placeholder="2025-06" />
          </div>
          <label className="flex items-center gap-2 mt-6 text-sm">
            <input type="checkbox" {...form.register('current')} /> Currently here
          </label>
        </div>

        <div>
          <Label hint="comma-separated">Tech</Label>
          <Input value={techCsv} onChange={(e) => setTechCsv(e.target.value)} placeholder="Flutter, Dart, REST" />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label>Bullets</Label>
            <Button variant="ghost" onClick={() => bullets.append({ fr: '', en: '' })}>
              <Plus size={12} className="inline -mt-0.5 mr-1" /> Add bullet
            </Button>
          </div>
          {bullets.fields.map((f, i) => (
            <div key={f.id} className="flex items-start gap-2">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input {...form.register(`bullets.${i}.fr`)} placeholder="FR" />
                <Input {...form.register(`bullets.${i}.en`)} placeholder="EN" />
              </div>
              <Button variant="danger" onClick={() => bullets.remove(i)} aria-label="Remove">
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
    <CollectionShell title="Experience" onAdd={startNew}>
      <div className="flex flex-col gap-2">
        {items.map((it) => (
          <ListItem
            key={it.id}
            title={`${it.company} — ${it.role.fr}`}
            subtitle={`${it.startDate} → ${it.endDate ?? 'present'} · ${it.tech.join(', ')}`}
            onEdit={() => startEdit(it)}
            onDelete={() => onDelete(it.id)}
          />
        ))}
        {items.length === 0 && <div className="text-sm opacity-70">No experience yet.</div>}
      </div>
    </CollectionShell>
  );
};
