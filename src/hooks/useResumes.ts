import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Resume } from '../types/app';

export function useResumes(uid: string) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, `users/${uid}/resumes`),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setResumes(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Resume, 'id'>) })));
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  async function addResume(name: string) {
    await addDoc(collection(db, `users/${uid}/resumes`), {
      name: name.trim(),
      createdAt: serverTimestamp(),
    });
  }

  async function renameResume(id: string, name: string) {
    await updateDoc(doc(db, `users/${uid}/resumes/${id}`), { name: name.trim() });
  }

  async function deleteResume(id: string) {
    await deleteDoc(doc(db, `users/${uid}/resumes/${id}`));
  }

  return { resumes, loading, addResume, renameResume, deleteResume };
}
