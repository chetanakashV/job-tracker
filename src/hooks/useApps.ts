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
import type { TrackedApp, AppFormData } from '../types/app';

export function useApps(uid: string) {
  const [apps, setApps] = useState<TrackedApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, `users/${uid}/apps`),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setApps(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TrackedApp, 'id'>) }))
      );
      setLoading(false);
    });

    return unsub;
  }, [uid]);

  async function addApp(data: AppFormData) {
    await addDoc(collection(db, `users/${uid}/apps`), {
      ...data,
      createdAt: serverTimestamp(),
    });
  }

  async function updateApp(id: string, data: AppFormData) {
    await updateDoc(doc(db, `users/${uid}/apps/${id}`), { ...data });
  }

  async function deleteApp(id: string) {
    await deleteDoc(doc(db, `users/${uid}/apps/${id}`));
  }

  return { apps, loading, addApp, updateApp, deleteApp };
}
