import { useState, useEffect } from 'react';
import type { TrackedApp, AppFormData, AppStatus } from '../types/app';
import styles from './AppForm.module.css';

interface Props {
  initial?: TrackedApp | null;
  onSubmit: (data: AppFormData) => Promise<void>;
  onClose: () => void;
}

const STATUSES: AppStatus[] = ['live', 'staging', 'down', 'maintenance'];

const EMPTY: AppFormData = {
  name: '',
  url: '',
  status: 'live',
  techStack: '',
  lastDeployed: '',
  notes: '',
};

export default function AppForm({ initial, onSubmit, onClose }: Props) {
  const [form, setForm] = useState<AppFormData>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      const { id: _id, createdAt: _ca, ...rest } = initial;
      setForm(rest);
    } else {
      setForm(EMPTY);
    }
  }, [initial]);

  function set(key: keyof AppFormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
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
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{initial ? 'Edit app' : 'Add app'}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            Name <span className={styles.req}>*</span>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="My Production App"
              required
            />
          </label>

          <label>
            URL
            <input
              value={form.url}
              onChange={(e) => set('url', e.target.value)}
              placeholder="https://myapp.com"
              type="url"
            />
          </label>

          <label>
            Status
            <select value={form.status} onChange={(e) => set('status', e.target.value as AppStatus)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </label>

          <label>
            Tech Stack
            <input
              value={form.techStack}
              onChange={(e) => set('techStack', e.target.value)}
              placeholder="React, Node, Postgres"
            />
          </label>

          <label>
            Last Deployed
            <input
              value={form.lastDeployed}
              onChange={(e) => set('lastDeployed', e.target.value)}
              placeholder="2024-06-07"
            />
          </label>

          <label>
            Notes
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Any notes about this app..."
              rows={3}
            />
          </label>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving…' : initial ? 'Save changes' : 'Add app'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
