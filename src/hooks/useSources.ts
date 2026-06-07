import { useState, useEffect } from 'react';
import {
  collection, addDoc, deleteDoc, doc,
  onSnapshot, serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';

const DEFAULT_SOURCES = ['LinkedIn', 'Indeed', 'Referral', 'Company Website', 'AngelList', 'Other'];

export interface Source {
  id: string;
  name: string;
  isDefault?: boolean;
}

export function useSources(uid: string) {
  const [custom, setCustom] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, `users/${uid}/sources`), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setCustom(snap.docs.map((d) => ({ id: d.id, name: d.data().name as string })));
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  // Merge defaults + custom, deduplicating by name
  const customNames = new Set(custom.map((s) => s.name));
  const defaults: Source[] = DEFAULT_SOURCES
    .filter((n) => !customNames.has(n))
    .map((n) => ({ id: `default_${n}`, name: n, isDefault: true }));

  const all: Source[] = [...defaults, ...custom];

  async function addSource(name: string): Promise<Source> {
    const trimmed = name.trim();
    const existing = all.find((s) => s.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;

    const ref = await addDoc(collection(db, `users/${uid}/sources`), {
      name: trimmed,
      createdAt: serverTimestamp(),
    });
    return { id: ref.id, name: trimmed };
  }

  async function deleteSource(id: string) {
    if (id.startsWith('default_')) return; // can't delete defaults
    await deleteDoc(doc(db, `users/${uid}/sources/${id}`));
  }

  return { sources: all, loading, addSource, deleteSource };
}
