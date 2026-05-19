// Field.tsx
// Tiny form primitives — labelled input/textarea/select with consistent
// macOS-leaning styling. Used by every admin form.

import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

const baseField =
  'w-full px-3 py-2 rounded-md text-sm bg-white/5 border border-white/10 outline-none focus:border-[var(--color-term-prompt-path)] focus:ring-2 focus:ring-[var(--color-term-prompt-path)]/30 transition';

export const Label = ({ children, hint }: { children: ReactNode; hint?: string }) => (
  <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: 'var(--color-term-fg)' }}>
    <span className="flex items-center gap-2">
      {children}
      {hint && <span className="font-normal opacity-60">{hint}</span>}
    </span>
  </label>
);

type InputProps = InputHTMLAttributes<HTMLInputElement> & { error?: string };

export const Input = ({ error, className = '', ...rest }: InputProps) => (
  <div className="flex flex-col gap-1">
    <input {...rest} className={`${baseField} ${className}`} />
    {error && <span className="text-xs" style={{ color: 'var(--color-term-error)' }}>{error}</span>}
  </div>
);

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string };

export const Textarea = ({ error, className = '', ...rest }: TextareaProps) => (
  <div className="flex flex-col gap-1">
    <textarea {...rest} className={`${baseField} min-h-[88px] resize-y ${className}`} />
    {error && <span className="text-xs" style={{ color: 'var(--color-term-error)' }}>{error}</span>}
  </div>
);

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = ({ className = '', ...rest }: SelectProps) => (
  <select {...rest} className={`${baseField} ${className}`} />
);

export const FieldRow = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
);

export const Button = ({
  variant = 'primary',
  className = '',
  type = 'button',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }) => {
  const variants = {
    primary: 'bg-[var(--color-term-prompt-path)] text-white hover:opacity-90',
    ghost: 'bg-white/5 hover:bg-white/10',
    danger: 'bg-[var(--color-term-error)] text-white hover:opacity-90',
  } as const;
  return (
    <button
      type={type}
      {...rest}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition disabled:opacity-50 ${variants[variant]} ${className}`}
    />
  );
};
