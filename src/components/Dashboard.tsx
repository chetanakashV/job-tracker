import { useState } from 'react';
import type { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useApps } from '../hooks/useApps';
import AppCard from './AppCard';
import AppForm from './AppForm';
import type { TrackedApp, AppFormData } from '../types/app';
import styles from './Dashboard.module.css';

interface Props {
  user: User;
}

type Filter = 'all' | TrackedApp['status'];

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Live', value: 'live' },
  { label: 'Staging', value: 'staging' },
  { label: 'Down', value: 'down' },
  { label: 'Maintenance', value: 'maintenance' },
];

export default function Dashboard({ user }: Props) {
  const { apps, loading, addApp, updateApp, deleteApp } = useApps(user.uid);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TrackedApp | null>(null);

  const visible = apps.filter((a) => {
    if (filter !== 'all' && a.status !== filter) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(app: TrackedApp) {
    setEditing(app);
    setModalOpen(true);
  }

  async function handleSubmit(data: AppFormData) {
    if (editing) {
      await updateApp(editing.id, data);
    } else {
      await addApp(data);
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this app?')) await deleteApp(id);
  }

  const counts = {
    live: apps.filter((a) => a.status === 'live').length,
    staging: apps.filter((a) => a.status === 'staging').length,
    down: apps.filter((a) => a.status === 'down').length,
    maintenance: apps.filter((a) => a.status === 'maintenance').length,
  };

  return (
    <div className={styles.wrap}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>⬡</span>
          <span className={styles.brand}>AppTracker</span>
        </div>
        <div className={styles.headerRight}>
          <img
            src={user.photoURL ?? undefined}
            alt={user.displayName ?? 'User'}
            className={styles.avatar}
          />
          <button className={styles.signOutBtn} onClick={() => signOut(auth)}>
            Sign out
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {/* Stats bar */}
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>{apps.length}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={`${styles.stat} ${styles.live}`}>
            <span className={styles.statNum}>{counts.live}</span>
            <span className={styles.statLabel}>Live</span>
          </div>
          <div className={`${styles.stat} ${styles.staging}`}>
            <span className={styles.statNum}>{counts.staging}</span>
            <span className={styles.statLabel}>Staging</span>
          </div>
          <div className={`${styles.stat} ${styles.down}`}>
            <span className={styles.statNum}>{counts.down}</span>
            <span className={styles.statLabel}>Down</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.filters}>
            {FILTERS.map((f) => (
              <button
                key={f.value}
                className={`${styles.filterBtn} ${filter === f.value ? styles.active : ''}`}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className={styles.toolbarRight}>
            <input
              className={styles.search}
              placeholder="Search apps…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className={styles.addBtn} onClick={openAdd}>+ Add app</button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className={styles.empty}>Loading…</div>
        ) : visible.length === 0 ? (
          <div className={styles.empty}>
            {apps.length === 0
              ? 'No apps yet. Add your first one!'
              : 'No apps match the current filter.'}
          </div>
        ) : (
          <div className={styles.grid}>
            {visible.map((app) => (
              <AppCard key={app.id} app={app} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>

      {modalOpen && (
        <AppForm
          initial={editing}
          onSubmit={handleSubmit}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
