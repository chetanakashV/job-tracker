import { useRef, useState } from 'react';
import JSZip from 'jszip';
import type { Resume } from '../types/app';
import styles from './ResumesPage.module.css';

interface Props {
  resumes: Resume[];
  onAdd: (name: string) => Promise<void>;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function ResumesPage({ resumes, onAdd, onRename, onDelete }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [zipNames, setZipNames] = useState<string[]>([]); // names extracted from zip, editable
  const [importing, setImporting] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');

  // ── Manual add ──────────────────────────────────────────────────────────
  async function handleAdd() {
    if (!newName.trim()) return;
    setAdding(true);
    try { await onAdd(newName.trim()); setNewName(''); }
    finally { setAdding(false); }
  }

  // ── Zip import ───────────────────────────────────────────────────────────
  async function onZipChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;

    const zip = await JSZip.loadAsync(f);
    const folderNames = new Set<string>();

    zip.forEach((relativePath) => {
      const parts = relativePath.split('/').filter(Boolean);
      // Top-level folder names only (ignore __MACOSX and hidden)
      if (parts.length >= 1 && !parts[0].startsWith('.') && parts[0] !== '__MACOSX') {
        folderNames.add(parts[0]);
      }
    });

    if (folderNames.size === 0) {
      alert('No folders found in the zip.');
      return;
    }

    setZipNames([...folderNames].sort());
  }

  async function confirmZipImport() {
    const valid = zipNames.map((n) => n.trim()).filter(Boolean);
    if (!valid.length) return;
    setImporting(true);
    try {
      await Promise.all(valid.map((name) => onAdd(name)));
      setZipNames([]);
    } finally {
      setImporting(false);
    }
  }

  // ── Rename existing ──────────────────────────────────────────────────────
  async function handleRename(id: string) {
    if (renameVal.trim()) await onRename(id, renameVal.trim());
    setRenamingId(null);
    setRenameVal('');
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h2 className={styles.heading}>My Resumes</h2>
        <button className={styles.zipBtn} onClick={() => fileRef.current?.click()}>
          Import from zip
        </button>
        <input ref={fileRef} type="file" accept=".zip" style={{ display: 'none' }} onChange={onZipChange} />
      </div>

      <p className={styles.hint}>
        Add resume names manually, or import a zip — folder names become resume labels.
      </p>

      {/* Zip preview */}
      {zipNames.length > 0 && (
        <div className={styles.zipBox}>
          <p className={styles.zipTitle}>📦 {zipNames.length} folder{zipNames.length !== 1 ? 's' : ''} found — edit before importing</p>
          <div className={styles.zipList}>
            {zipNames.map((name, i) => (
              <input
                key={i}
                className={styles.zipInput}
                value={name}
                onChange={(e) => {
                  const updated = [...zipNames];
                  updated[i] = e.target.value;
                  setZipNames(updated);
                }}
                disabled={importing}
              />
            ))}
          </div>
          <div className={styles.zipActions}>
            <button className={styles.cancelBtn} onClick={() => setZipNames([])} disabled={importing}>
              Cancel
            </button>
            <button className={styles.addBtn} onClick={confirmZipImport} disabled={importing}>
              {importing ? 'Importing…' : `Import ${zipNames.length}`}
            </button>
          </div>
        </div>
      )}

      {/* Manual add */}
      <div className={styles.addRow}>
        <input
          className={styles.addInput}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="e.g. SDE — Backend focused"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          disabled={adding}
        />
        <button className={styles.addBtn} onClick={handleAdd} disabled={adding || !newName.trim()}>
          {adding ? 'Adding…' : 'Add'}
        </button>
      </div>

      {resumes.length === 0 ? (
        <div className={styles.empty}>No resumes yet. Add a name or import from a zip.</div>
      ) : (
        <div className={styles.list}>
          {resumes.map((r) => (
            <div key={r.id} className={styles.item}>
              <span className={styles.itemIcon}>📄</span>

              {renamingId === r.id ? (
                <input
                  className={styles.renameInput}
                  value={renameVal}
                  onChange={(e) => setRenameVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename(r.id);
                    if (e.key === 'Escape') { setRenamingId(null); setRenameVal(''); }
                  }}
                  onBlur={() => handleRename(r.id)}
                  autoFocus
                />
              ) : (
                <span className={styles.itemName}>{r.name}</span>
              )}

              <div className={styles.itemActions}>
                <button className={styles.renameBtn} onClick={() => { setRenamingId(r.id); setRenameVal(r.name); }}>
                  Rename
                </button>
                <button className={styles.deleteBtn} onClick={() => confirm(`Delete "${r.name}"?`) && onDelete(r.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
