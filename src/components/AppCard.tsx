import type { TrackedApp } from '../types/app';
import styles from './AppCard.module.css';

interface Props {
  app: TrackedApp;
  onEdit: (app: TrackedApp) => void;
  onDelete: (id: string) => void;
}

const STATUS_LABEL: Record<TrackedApp['status'], string> = {
  live: 'Live',
  staging: 'Staging',
  down: 'Down',
  maintenance: 'Maintenance',
};

export default function AppCard({ app, onEdit, onDelete }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.name}>{app.name}</span>
          <span className={`${styles.badge} ${styles[app.status]}`}>
            <span className={styles.dot} />
            {STATUS_LABEL[app.status]}
          </span>
        </div>
        {app.url && (
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.url}
          >
            {app.url.replace(/^https?:\/\//, '')}
          </a>
        )}
      </div>

      <div className={styles.meta}>
        {app.techStack && (
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Stack</span>
            <span>{app.techStack}</span>
          </div>
        )}
        {app.lastDeployed && (
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Deployed</span>
            <span>{app.lastDeployed}</span>
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
