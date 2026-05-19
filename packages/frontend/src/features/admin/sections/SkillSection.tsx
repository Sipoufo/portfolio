// SkillSection.tsx

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { skillInputSchema, type Skill, type SkillInput } from '@portfolio/shared';
import { api } from '@/services/api';
import { Button, Input, Label, Select } from '@/components/ui/Field';
import { CollectionShell, ListItem } from './CollectionShell';

const CATEGORIES: SkillInput['category'][] = [
  'mobile',
  'backend',
  'frontend',
  'database',
  'devops',
  'management',
  'language',
];

const empty: SkillInput = { category: 'mobile', name: '', order: 0 };

export const SkillSection = () => {
  const [items, setItems] = useState<Skill[]>([]);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);

  const form = useForm<SkillInput>({
    resolver: zodResolver(skillInputSchema),
    defaultValues: empty,
  });

  const load = async () => setItems(await api.skills());
  useEffect(() => {
    void load();
  }, []);

  const startNew = () => {
    form.reset(empty);
    setEditingId('new');
  };

  const startEdit = (it: Skill) => {
    form.reset({ category: it.category, name: it.name, level: it.level, order: it.order });
    setEditingId(it.id);
  };

  const onSubmit = async (data: SkillInput) => {
    if (editingId === 'new') await api.createSkill(data);
    else if (editingId) await api.updateSkill(editingId, data);
    setEditingId(null);
    await load();
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this skill?')) return;
    await api.deleteSkill(id);
    await load();
  };

  if (editingId !== null) {
    return (
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3 max-w-xl">
        <h2 className="text-lg font-semibold">{editingId === 'new' ? 'New skill' : 'Edit skill'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>Category</Label>
            <Select {...form.register('category')}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Order</Label>
            <Input type="number" {...form.register('order', { valueAsNumber: true })} />
          </div>
        </div>
        <Label>Name</Label>
        <Input {...form.register('name')} />
        <div className="flex items-center gap-2 pt-2">
          <Button type="submit">Save</Button>
          <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
        </div>
      </form>
    );
  }

  return (
    <CollectionShell title="Skills" onAdd={startNew}>
      <div className="flex flex-col gap-2">
        {items.map((it) => (
          <ListItem
            key={it.id}
            title={it.name}
            subtitle={it.category}
            onEdit={() => startEdit(it)}
            onDelete={() => onDelete(it.id)}
          />
        ))}
        {items.length === 0 && <div className="text-sm opacity-70">No skill yet.</div>}
      </div>
    </CollectionShell>
  );
};
