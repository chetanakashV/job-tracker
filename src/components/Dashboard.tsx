import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useApps } from '../hooks/useApps';
import { useResumes } from '../hooks/useResumes';
import { useSources } from '../hooks/useSources';
import AppCard from './AppCard';
import AppForm from './AppForm';
import ResumesPage from './ResumesPage';
import type { JobApplication, JobFormData, AppStatus } from '../types/app';
import type { Prefill } from '../App';
import styles from './Dashboard.module.css';

interface Props {
  user: User;
  prefill?: Prefill | null;
}

type Tab = 'jobs' | 'resumes';
type Filter = 'all' | AppStatus;

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Applied', value: 'applied' },
  { label: 'Screening', value: 'screening' },
  { label: 'Interview', value: 'interview' },
  { label: 'Offer', value: 'offer' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Ghosted', value: 'ghosted' },
];

export default function Dashboard({ user, prefill }: Props) {
  const { apps, loading, error, addApp, updateApp, deleteApp } = useApps(user.uid);
  const { resumes, addResume, renameResume, deleteResume } = useResumes(user.uid);
  const { sources, addSource } = useSources(user.uid);
  const [tab, setTab] = useState<Tab>('jobs');
  const [filter, setFilter] = useState<Filter>('all');
  const [sourceFilter, setSourceFilter] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [modalOpen, setModalOpen] = useState(() => !!prefill);
  const [editing, setEditing] = useState<JobApplication | null>(null);

  const visible = apps.filter((a) => {
    if (filter !== 'all' && a.status !== filter) return false;
    const q = search.toLowerCase();
    if (q && !a.company.toLowerCase().includes(q) && !a.role.toLowerCase().includes(q)) return false;
    if (dateFrom && a.dateApplied && a.dateApplied < dateFrom) return false;
    if (dateTo && a.dateApplied && a.dateApplied > dateTo) return false;
    if (sourceFilter && a.source !== sourceFilter) return false;
    return true;
  });

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !modalOpen && tab === 'jobs') {
        e.preventDefault();
        openAdd();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalOpen, tab]);

  function openAdd() { setEditing(null); setModalOpen(true); }
  function openEdit(app: JobApplication) { setEditing(app); setModalOpen(true); }

  async function handleSubmit(data: JobFormData) {
    if (editing) await updateApp(editing.id, data);
    else await addApp(data);
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this application?')) await deleteApp(id);
  }

  const counts = {
    total: apps.length,
    interview: apps.filter((a) => a.status === 'interview').length,
    offer: apps.filter((a) => a.status === 'offer').length,
    rejected: apps.filter((a) => a.status === 'rejected').length,
  };

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>💼</span>
          <span className={styles.brand}>JobTracker</span>
          <span className={styles.version}>v{__APP_VERSION__}</span>
        </div>
        <nav className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'jobs' ? styles.activeTab : ''}`}
            onClick={() => setTab('jobs')}
          >
            Applications
          </button>
          <button
            className={`${styles.tab} ${tab === 'resumes' ? styles.activeTab : ''}`}
            onClick={() => setTab('resumes')}
          >
            Resumes {resumes.length > 0 && <span className={styles.badge}>{resumes.length}</span>}
          </button>
        </nav>
        <div className={styles.headerRight}>
          <a
            href="/bookmarklet.html"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.bookmarkletBtn}
            title="Install bookmarklet to log jobs from LinkedIn / Instahyre"
          >
            ⚡ Bookmarklet
          </a>
          {user.photoURL && <img src={user.photoURL} alt="" className={styles.avatar} />}
          <button className={styles.signOutBtn} onClick={() => signOut(auth)}>Sign out</button>
        </div>
      </header>

      {tab === 'resumes' ? (
        <ResumesPage
          resumes={resumes}
          onAdd={addResume}
          onRename={renameResume}
          onDelete={deleteResume}
        />
      ) : (
        <main className={styles.main}>
          {/* Stats */}
          <div className={styles.statsWrap}>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statNum}>{counts.total}</span>
                <span className={styles.statLabel}>Total</span>
              </div>
              <div className={`${styles.stat} ${styles.interview}`}>
                <span className={styles.statNum}>{counts.interview}</span>
                <span className={styles.statLabel}>Interviews</span>
              </div>
              <div className={`${styles.stat} ${styles.offer}`}>
                <span className={styles.statNum}>{counts.offer}</span>
                <span className={styles.statLabel}>Offers</span>
              </div>
              <div className={`${styles.stat} ${styles.rejected}`}>
                <span className={styles.statNum}>{counts.rejected}</span>
                <span className={styles.statLabel}>Rejected</span>
              </div>
            </div>
          </div>

          {/* Search + Add */}
          <div className={styles.searchRow}>
            <input
              className={styles.search}
              placeholder="Search company or role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className={styles.addBtn} onClick={openAdd}>+ Log job</button>
          </div>

          {/* Date range */}
          <div className={styles.dateRow}>
            <span className={styles.dateLabel}>From</span>
            <input type="date" className={styles.dateInput} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <span className={styles.dateLabel}>To</span>
            <input type="date" className={styles.dateInput} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            {(dateFrom || dateTo) && (
              <button className={styles.clearDate} onClick={() => { setDateFrom(''); setDateTo(''); }}>✕ Clear</button>
            )}
          </div>

          {/* Status filters */}
          <div className={styles.filtersWrap}>
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
          </div>

          {/* Source filters — only show sources that have at least one app */}
          {(() => {
            const usedSources = [...new Set(apps.map((a) => a.source).filter(Boolean))];
            if (usedSources.length < 2) return null;
            return (
              <div className={styles.filtersWrap}>
                <div className={styles.filters}>
                  <button
                    className={`${styles.filterBtn} ${!sourceFilter ? styles.active : ''}`}
                    onClick={() => setSourceFilter('')}
                  >
                    All sources
                  </button>
                  {usedSources.map((s) => (
                    <button
                      key={s}
                      className={`${styles.filterBtn} ${sourceFilter === s ? styles.active : ''}`}
                      onClick={() => setSourceFilter(s === sourceFilter ? '' : s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Cards */}
          {loading ? (
            <div className={styles.empty}>Loading…</div>
          ) : error ? (
            <div className={styles.errorBox}>
              <strong>Firestore error:</strong> {error}
              <br /><br />
              Make sure you've created a Firestore database in the Firebase console and that rules allow reads.
            </div>
          ) : visible.length === 0 ? (
            <div className={styles.empty}>
              {apps.length === 0
                ? <>No applications yet.<br />Tap <strong>+ Log job</strong> to add your first one!</>
                : 'No applications match the current filter.'}
            </div>
          ) : (
            <div className={styles.grid}>
              {visible.map((app) => (
                <AppCard key={app.id} app={app} onEdit={openEdit} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </main>
      )}

      {modalOpen && (
        <AppForm
          initial={editing}
          prefill={editing ? null : prefill}
          resumes={resumes}
          sources={sources}
          onAddSource={addSource}
          onSubmit={handleSubmit}
          onClose={() => setModalOpen(false)}
        />
      )}

      {tab === 'jobs' && (
        <button className={styles.fab} onClick={openAdd} aria-label="Log job">+</button>
      )}
    </div>
  );
}
