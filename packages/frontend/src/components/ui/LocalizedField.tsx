// LocalizedField.tsx
// Side-by-side FR / EN inputs for a LocalizedString value used across the
// admin forms. Hooks into react-hook-form via the `name` prefix.

import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Input, Label, Textarea } from './Field';

type Props = {
  label: string;
  namePrefix: string;
  register: UseFormRegister<Record<string, unknown>>;
  errors?: FieldErrors;
  multiline?: boolean;
};

export const LocalizedField = ({ label, namePrefix, register, errors, multiline }: Props) => {
  const frError = pickError(errors, `${namePrefix}.fr`);
  const enError = pickError(errors, `${namePrefix}.en`);

  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {multiline ? (
          <Textarea {...register(`${namePrefix}.fr` as never)} placeholder="FR" error={frError} />
        ) : (
          <Input {...register(`${namePrefix}.fr` as never)} placeholder="FR" error={frError} />
        )}
        {multiline ? (
          <Textarea {...register(`${namePrefix}.en` as never)} placeholder="EN" error={enError} />
        ) : (
          <Input {...register(`${namePrefix}.en` as never)} placeholder="EN" error={enError} />
        )}
      </div>
    </div>
  );
};

const pickError = (errors: FieldErrors | undefined, path: string): string | undefined => {
  if (!errors) return undefined;
  const parts = path.split('.');
  let node: unknown = errors;
  for (const p of parts) {
    if (!node || typeof node !== 'object') return undefined;
    node = (node as Record<string, unknown>)[p];
  }
  if (node && typeof node === 'object' && 'message' in node) {
    return String((node as { message?: string }).message ?? '');
  }
  return undefined;
};
