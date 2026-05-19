// CvSection.tsx
// Upload/replace the CV PDF served by GET /api/cv.

import { useRef, useState } from 'react';
import { Download, FileUp, FileText } from 'lucide-react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/Field';

export const CvSection = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  // Cache buster so the iframe/link refresh after an upload.
  const [version, setVersion] = useState(0);

  const onPick = () => inputRef.current?.click();

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('The file must be a PDF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('The file must be smaller than 5 MB.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await api.uploadCv(file);
      setSavedAt(new Date().toLocaleTimeString());
      setVersion((v) => v + 1);
    } catch (err) {
      const detail = (err as Error & { detail?: { error?: string } }).detail;
      setError(detail?.error ?? (err instanceof Error ? err.message : 'Upload failed'));
    } finally {
      setBusy(false);
    }
  };

  const cvUrl = `${api.cvUrl()}?v=${version}`;

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">CV</h2>
        <div className="flex items-center gap-2">
          <a href={cvUrl} target="_blank" rel="noreferrer">
            <Button variant="ghost" type="button">
              <Download size={14} className="inline -mt-0.5 mr-1" /> Download current
            </Button>
          </a>
          <Button onClick={onPick} disabled={busy}>
            <FileUp size={14} className="inline -mt-0.5 mr-1" />
            {busy ? 'Uploading…' : 'Upload new PDF'}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={onChange}
          />
        </div>
      </div>

      {error && (
        <div
          className="px-3 py-2 rounded-md text-sm"
          style={{ background: 'rgba(248,81,73,0.1)', color: 'var(--color-term-error)', border: '1px solid var(--color-term-error)' }}
        >
          {error}
        </div>
      )}
      {savedAt && !error && (
        <div className="text-xs" style={{ color: 'var(--color-term-success)' }}>
          CV uploaded at {savedAt}. The public terminal will serve the new file immediately.
        </div>
      )}

      <div
        className="rounded-md overflow-hidden"
        style={{ border: '1px solid var(--color-window-border)', background: 'rgba(0,0,0,0.15)' }}
      >
        <div
          className="px-3 py-2 text-xs flex items-center gap-2"
          style={{ color: 'var(--color-term-muted)', borderBottom: '1px solid var(--color-window-border)' }}
        >
          <FileText size={14} /> Preview
        </div>
        <object data={cvUrl} type="application/pdf" className="w-full h-[60vh]">
          <div className="p-4 text-sm">
            Your browser can&apos;t preview PDFs inline.{' '}
            <a href={cvUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-term-link)' }}>
              Open in a new tab
            </a>
            .
          </div>
        </object>
      </div>

      <p className="text-xs" style={{ color: 'var(--color-term-muted)' }}>
        Only PDF files are accepted (max 5 MB). The uploaded file replaces the bundled CV and is
        served by <code>GET /api/cv</code> + the <code>download cv</code> terminal command.
      </p>
    </div>
  );
};
