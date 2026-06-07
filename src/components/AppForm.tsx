import { useState, useEffect, useRef } from 'react';
import type { JobApplication, JobFormData, AppStatus, Resume } from '../types/app';
import styles from './AppForm.module.css';

interface Props {
  initial?: JobApplication | null;
  resumes: Resume[];
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

const SOURCES = ['LinkedIn', 'Indeed', 'Referral', 'Company Website', 'AngelList', 'Other'];

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

export default function AppForm({ initial, resumes, onSubmit, onClose }: Props) {
  const [form, setForm] = useState<JobFormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (initial) {
      const { id: _id, createdAt: _ca, ...rest } = initial;
      setForm(rest);
    } else {
      setForm({ ...EMPTY, dateApplied: new Date().toISOString().slice(0, 10) });
    }
  }, [initial]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!saving) formRef.current?.requestSubmit();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [saving]);

  function set(key: keyof JobFormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
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
              <input
                value={form.company}
                onChange={(e) => set('company', e.target.value)}
                placeholder="Google"
                required
              />
            </label>
            <label>
              Role <span className={styles.req}>*</span>
              <input
                value={form.role}
                onChange={(e) => set('role', e.target.value)}
                placeholder="Software Engineer"
                required
              />
            </label>
          </div>

          <div className={styles.row}>
            <label>
              Status
              <select value={form.status} onChange={(e) => set('status', e.target.value as AppStatus)}>
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>
            <label>
              Date Applied
              <input
                type="date"
                value={form.dateApplied}
                onChange={(e) => set('dateApplied', e.target.value)}
              />
            </label>
          </div>

          <div className={styles.row}>
            <label>
              Source
              <select value={form.source} onChange={(e) => set('source', e.target.value)}>
                {SOURCES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Location
              <input
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="Remote / Bangalore"
              />
            </label>
          </div>

          <div className={styles.row}>
            <label>
              Salary Range
              <input
                value={form.salaryRange}
                onChange={(e) => set('salaryRange', e.target.value)}
                placeholder="₹20–25 LPA"
              />
            </label>
            <label>
              Job URL
              <input
                value={form.jobUrl}
                onChange={(e) => set('jobUrl', e.target.value)}
                placeholder="https://linkedin.com/jobs/..."
              />
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
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </label>
          )}

          <label>
            Notes
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Interview rounds, recruiter name, impressions…"
              rows={3}
            />
          </label>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving…' : initial ? 'Save changes' : 'Log application'}
            {!saving && <span style={{opacity:0.6, fontSize:'11px', marginLeft:'6px'}}>⌘↵</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
