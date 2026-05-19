// ProfileSection.tsx
// Singleton profile form.

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileInputSchema, type ProfileInput } from '@portfolio/shared';
import { api } from '@/services/api';
import { Button, Input, Label } from '@/components/ui/Field';
import { LocalizedField } from '@/components/ui/LocalizedField';

export const ProfileSection = () => {
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileInputSchema),
    defaultValues: {
      name: '',
      title: { fr: '', en: '' },
      summary: { fr: '', en: '' },
      email: '',
      phone: '',
      location: { fr: '', en: '' },
      socials: {},
    },
  });

  useEffect(() => {
    void api.profile().then((p) =>
      reset({
        name: p.name,
        title: p.title,
        summary: p.summary,
        email: p.email,
        phone: p.phone ?? '',
        location: p.location,
        socials: p.socials,
      }),
    );
  }, [reset]);

  const onSubmit = async (data: ProfileInput) => {
    setError(null);
    try {
      await api.saveProfile(data);
      setSavedAt(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-2xl">
      <h2 className="text-lg font-semibold">Profile</h2>

      <Label>Name</Label>
      <Input {...register('name')} error={errors.name?.message} />

      <LocalizedField
        label="Title"
        namePrefix="title"
        register={register as never}
        errors={errors as never}
      />

      <LocalizedField
        label="Summary"
        namePrefix="summary"
        register={register as never}
        errors={errors as never}
        multiline
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>Email</Label>
          <Input type="email" {...register('email')} error={errors.email?.message} />
        </div>
        <div>
          <Label>Phone</Label>
          <Input {...register('phone')} />
        </div>
      </div>

      <LocalizedField
        label="Location"
        namePrefix="location"
        register={register as never}
        errors={errors as never}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>GitHub URL</Label>
          <Input {...register('socials.github')} placeholder="https://github.com/…" />
        </div>
        <div>
          <Label>LinkedIn URL</Label>
          <Input {...register('socials.linkedin')} placeholder="https://linkedin.com/in/…" />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save profile'}
        </Button>
        {savedAt && (
          <span className="text-xs" style={{ color: 'var(--color-term-success)' }}>
            Saved at {savedAt}
          </span>
        )}
        {error && (
          <span className="text-xs" style={{ color: 'var(--color-term-error)' }}>
            {error}
          </span>
        )}
      </div>
    </form>
  );
};
