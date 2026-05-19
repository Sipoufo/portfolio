// parser.ts
// Minimal shell tokenizer. Supports double-quoted strings.

export type ParsedInput = {
  cmd: string;
  args: string[];
  raw: string;
};

export const parse = (raw: string): ParsedInput | null => {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const tokens: string[] = [];
  let current = '';
  let inQuotes = false;
  for (const ch of trimmed) {
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && /\s/.test(ch)) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }
    current += ch;
  }
  if (current) tokens.push(current);
  const [cmd, ...args] = tokens;
  if (!cmd) return null;
  return { cmd: cmd.toLowerCase(), args, raw: trimmed };
};
