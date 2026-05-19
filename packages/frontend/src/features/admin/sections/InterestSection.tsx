// InterestSection.tsx

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { interestInputSchema, type Interest, type InterestInput } from '@portfolio/shared';
import { api } from '@/services/api';
import { Button, Input, Label } from '@/components/ui/Field';
import { LocalizedField } from '@/components/ui/LocalizedField';
import { CollectionShell, ListItem } from './CollectionShell';

const empty: InterestInput = { label: { fr: '', en: '' }, order: 0 };

export const InterestSection = () => {
  const [items, setItems] = useState<Interest[]>([]);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);

  const form = useForm<InterestInput>({
    resolver: zodResolver(interestInputSchema),
    defaultValues: empty,
  });

  const load = async () => setItems(await api.interests());
  useEffect(() => {
    void load();
  }, []);

  const startNew = () => {
    form.reset(empty);
    setEditingId('new');
  };

  const startEdit = (it: Interest) => {
    form.reset({ label: it.label, order: it.order });
    setEditingId(it.id);
  };

  const onSubmit = async (data: InterestInput) => {
    if (editingId === 'new') await api.createInterest(data);
    else if (editingId) await api.updateInterest(editingId, data);
    setEditingId(null);
    await load();
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this interest?')) return;
    await api.deleteInterest(id);
    await load();
  };

  if (editingId !== null) {
    return (
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3 max-w-lg">
        <h2 className="text-lg font-semibold">{editingId === 'new' ? 'New interest' : 'Edit interest'}</h2>
        <LocalizedField label="Label" namePrefix="label" register={form.register as never} errors={form.formState.errors as never} />
        <div>
          <Label>Order</Label>
          <Input type="number" {...form.register('order', { valueAsNumber: true })} />
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Button type="submit">Save</Button>
          <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
        </div>
      </form>
    );
  }

  return (
    <CollectionShell title="Interests" onAdd={startNew}>
      <div className="flex flex-col gap-2">
        {items.map((it) => (
          <ListItem
            key={it.id}
            title={it.label.fr}
            subtitle={it.label.en}
            onEdit={() => startEdit(it)}
            onDelete={() => onDelete(it.id)}
          />
        ))}
        {items.length === 0 && <div className="text-sm opacity-70">No interest yet.</div>}
      </div>
    </CollectionShell>
  );
};
