// EducationSection.tsx

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { educationInputSchema, type Education, type EducationInput } from '@portfolio/shared';
import { api } from '@/services/api';
import { Button, Input, Label } from '@/components/ui/Field';
import { LocalizedField } from '@/components/ui/LocalizedField';
import { CollectionShell, ListItem } from './CollectionShell';

const empty: EducationInput = {
  school: '',
  degree: { fr: '', en: '' },
  location: { fr: '', en: '' },
  startDate: '',
  endDate: null,
  order: 0,
};

export const EducationSection = () => {
  const [items, setItems] = useState<Education[]>([]);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);

  const form = useForm<EducationInput>({
    resolver: zodResolver(educationInputSchema),
    defaultValues: empty,
  });

  const load = async () => setItems(await api.education());
  useEffect(() => {
    void load();
  }, []);

  const startNew = () => {
    form.reset(empty);
    setEditingId('new');
  };

  const startEdit = (it: Education) => {
    form.reset({
      school: it.school,
      degree: it.degree,
      location: it.location,
      startDate: it.startDate,
      endDate: it.endDate,
      order: it.order,
    });
    setEditingId(it.id);
  };

  const onSubmit = async (data: EducationInput) => {
    if (editingId === 'new') await api.createEducation(data);
    else if (editingId) await api.updateEducation(editingId, data);
    setEditingId(null);
    await load();
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    await api.deleteEducation(id);
    await load();
  };

  if (editingId !== null) {
    return (
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3 max-w-2xl">
        <h2 className="text-lg font-semibold">{editingId === 'new' ? 'New education' : 'Edit education'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>School</Label>
            <Input {...form.register('school')} />
          </div>
          <div>
            <Label>Order</Label>
            <Input type="number" {...form.register('order', { valueAsNumber: true })} />
          </div>
        </div>
        <LocalizedField label="Degree" namePrefix="degree" register={form.register as never} errors={form.formState.errors as never} />
        <LocalizedField label="Location" namePrefix="location" register={form.register as never} errors={form.formState.errors as never} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label hint="YYYY-MM">Start date</Label>
            <Input {...form.register('startDate')} placeholder="2019-09" />
          </div>
          <div>
            <Label hint="YYYY-MM">End date</Label>
            <Input {...form.register('endDate')} placeholder="2024-06" />
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Button type="submit">Save</Button>
          <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
        </div>
      </form>
    );
  }

  return (
    <CollectionShell title="Education" onAdd={startNew}>
      <div className="flex flex-col gap-2">
        {items.map((it) => (
          <ListItem
            key={it.id}
            title={`${it.school} — ${it.degree.fr}`}
            subtitle={`${it.startDate} → ${it.endDate ?? 'present'}`}
            onEdit={() => startEdit(it)}
            onDelete={() => onDelete(it.id)}
          />
        ))}
        {items.length === 0 && <div className="text-sm opacity-70">No education yet.</div>}
      </div>
    </CollectionShell>
  );
};
