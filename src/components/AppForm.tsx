import { useState, useEffect, useRef } from 'react';
import type { JobApplication, JobFormData, AppStatus, Resume } from '../types/app';
import type { Source } from '../hooks/useSources';
import type { Prefill } from '../App';
import styles from './AppForm.module.css';

interface Props {
  initial?: JobApplication | null;
  prefill?: Prefill | null;
  resumes: Resume[];
  sources: Source[];
  onAddSource: (name: string) => Promise<Source>;
  onSubmit: (data: JobFormData) => Promise<void>;
  onClose: () => void;
}

const STATUSES: { value: AppStatus; label: string }[] = [
  { value: 'applied',    label: 'Applied' },
  { value: 'screening',  label: 'Screening' },
  { value: 'interview',  label: 'Interview' },
  { value: 'offer',      label: 'Offer' },
  { value: 'rejected',   label: 'Rejected' },
  { value: 'ghosted',    label: 'Ghosted' },
  { value: 'withdrawn',  label: 'Withdrawn' },
];

const ADD_NEW = '__add_new__';

const EMPTY: JobFormData = {
  company: '',
  role: '',
  status: 'applied',
  dateApplied: new Date().toISOString().slice(0, 10),
  source: 'LinkedIn',
  location: '',
  salaryRange: '',
  jobUrl: '',
  resumeId: '',
  resumeName: '',
  notes: '',
};

export default function AppForm({ initial, prefill, resumes, sources, onAddSource, onSubmit, onClose }: Props) {
  const [form, setForm] = useState<JobFormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [addingSource, setAddingSource] = useState(false);
  const [newSourceVal, setNewSourceVal] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const newSourceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initial) {
      const { id: _id, createdAt: _ca, ...rest } = initial;
      setForm(rest);
    } else {
      setForm({
        ...EMPTY,
        dateApplied: new Date().toISOString().slice(0, 10),
        ...(prefill ? {
          company:  prefill.company,
          role:     prefill.role,
          jobUrl:   prefill.jobUrl,
          source:   prefill.source || 'LinkedIn',
          location: prefill.location,
        } : {}),
      });
    }
  }, [initial]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!saving && !addingSource) formRef.current?.requestSubmit();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [saving, addingSource]);

  useEffect(() => {
    if (addingSource) newSourceRef.current?.focus();
  }, [addingSource]);

  function set(key: keyof JobFormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSourceChange(val: string) {
    if (val === ADD_NEW) {
      setAddingSource(true);
      setNewSourceVal('');
    } else {
      set('source', val);
    }
  }

  async function confirmNewSource() {
    const name = newSourceVal.trim();
    if (!name) { setAddingSource(false); return; }
    const saved = await onAddSource(name);
    set('source', saved.name);
    setAddingSource(false);
    setNewSourceVal('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company.trim() || !form.role.trim()) return;
    setSaving(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle} />
        <div className={styles.sheetHeader}>
          <h2>{initial ? 'Edit application' : 'Log application'}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <label>
              Company <span className={styles.req}>*</span>
              <input value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Google" required />
            </label>
            <label>
              Role <span className={styles.req}>*</span>
              <input value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="Software Engineer" required />
            </label>
          </div>

          <div className={styles.row}>
            <label>
              Status
              <select value={form.status} onChange={(e) => set('status', e.target.value as AppStatus)}>
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </label>
            <label>
              Date Applied
              <input type="date" value={form.dateApplied} onChange={(e) => set('dateApplied', e.target.value)} />
            </label>
          </div>

          <div className={styles.row}>
            <label>
              Source
              {addingSource ? (
                <div className={styles.newSourceRow}>
                  <input
                    ref={newSourceRef}
                    className={styles.newSourceInput}
                    value={newSourceVal}
                    onChange={(e) => setNewSourceVal(e.target.value)}
                    placeholder="e.g. Naukri, Campus drive…"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); confirmNewSource(); }
                      if (e.key === 'Escape') { setAddingSource(false); }
                    }}
                  />
                  <button type="button" className={styles.newSourceSave} onClick={confirmNewSource}>Add</button>
                  <button type="button" className={styles.newSourceCancel} onClick={() => setAddingSource(false)}>✕</button>
                </div>
              ) : (
                <select value={form.source} onChange={(e) => handleSourceChange(e.target.value)}>
                  {sources.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                  <option value={ADD_NEW}>➕ Add new source…</option>
                </select>
              )}
            </label>
            <label>
              Location
              <input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Remote / Bangalore" />
            </label>
          </div>

          <div className={styles.row}>
            <label>
              Salary Range
              <input value={form.salaryRange} onChange={(e) => set('salaryRange', e.target.value)} placeholder="₹20–25 LPA" />
            </label>
            <label>
              Job URL
              <input value={form.jobUrl} onChange={(e) => set('jobUrl', e.target.value)} placeholder="https://linkedin.com/jobs/..." />
            </label>
          </div>

          {resumes.length > 0 && (
            <label>
              Resume used
              <select
                value={form.resumeId}
                onChange={(e) => {
                  const r = resumes.find((r) => r.id === e.target.value);
                  set('resumeId', e.target.value);
                  set('resumeName', r?.name ?? '');
                }}
              >
                <option value="">— None selected —</option>
                {resumes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </label>
          )}

          <label>
            Notes
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Interview rounds, recruiter name, impressions…" rows={3} />
          </label>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving…' : initial ? 'Save changes' : 'Log application'}
              {!saving && <span style={{ opacity: 0.6, fontSize: '11px', marginLeft: '6px' }}>⌘↵</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
