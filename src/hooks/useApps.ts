import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { JobApplication, JobFormData } from '../types/app';

export function useApps(uid: string) {
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, `users/${uid}/apps`),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setApps(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<JobApplication, 'id'>) }))
        );
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Firestore error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsub;
  }, [uid]);

  async function addApp(data: JobFormData) {
    await addDoc(collection(db, `users/${uid}/apps`), {
      ...data,
      createdAt: serverTimestamp(),
    });
  }

  async function updateApp(id: string, data: JobFormData) {
    await updateDoc(doc(db, `users/${uid}/apps/${id}`), { ...data });
  }

  async function deleteApp(id: string) {
    await deleteDoc(doc(db, `users/${uid}/apps/${id}`));
  }

  return { apps, loading, error, addApp, updateApp, deleteApp };
}
