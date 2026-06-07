import type { JobApplication } from '../types/app';
import styles from './AppCard.module.css';

interface Props {
  app: JobApplication;
  onEdit: (app: JobApplication) => void;
  onDelete: (id: string) => void;
}

const STATUS_LABEL: Record<JobApplication['status'], string> = {
  applied: 'Applied',
  screening: 'Screening',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  ghosted: 'Ghosted',
  withdrawn: 'Withdrawn',
};

const SOURCE_ICON: Record<string, string> = {
  LinkedIn: '💼',
  Indeed: '🔍',
  Referral: '🤝',
  'Company Website': '🌐',
  AngelList: '🚀',
  Other: '📌',
};

export default function AppCard({ app, onEdit, onDelete }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.titleBlock}>
            <span className={styles.company}>{app.company}</span>
            <span className={styles.role}>{app.role}</span>
          </div>
          <span className={`${styles.badge} ${styles[app.status]}`}>
            <span className={styles.dot} />
            {STATUS_LABEL[app.status]}
          </span>
        </div>
      </div>

      <div className={styles.meta}>
        {app.dateApplied && (
          <div className={styles.metaRow}>
            <span className={styles.metaIcon}>📅</span>
            <span>{app.dateApplied}</span>
          </div>
        )}
        {app.location && (
          <div className={styles.metaRow}>
            <span className={styles.metaIcon}>📍</span>
            <span>{app.location}</span>
          </div>
        )}
        {app.salaryRange && (
          <div className={styles.metaRow}>
            <span className={styles.metaIcon}>💰</span>
            <span>{app.salaryRange}</span>
          </div>
        )}
        {app.source && (
          <div className={styles.metaRow}>
            <span className={styles.metaIcon}>{SOURCE_ICON[app.source] ?? '📌'}</span>
            <span>{app.source}</span>
          </div>
        )}
        {app.jobUrl && (
          <div className={styles.metaRow}>
            <span className={styles.metaIcon}>🔗</span>
            <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
              View posting
            </a>
          </div>
        )}
        {app.resumeName && (
          <div className={styles.metaRow}>
            <span className={styles.metaIcon}>📎</span>
            <span>{app.resumeName}</span>
          </div>
        )}
        {app.notes && (
          <p className={styles.notes}>{app.notes}</p>
        )}
      </div>

      <div className={styles.actions}>
        <button className={styles.editBtn} onClick={() => onEdit(app)}>Edit</button>
        <button className={styles.deleteBtn} onClick={() => onDelete(app.id)}>Delete</button>
      </div>
    </div>
  );
}
