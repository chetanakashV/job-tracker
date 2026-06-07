import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './firebase';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

export interface Prefill {
  company: string;
  role: string;
  jobUrl: string;
  source: string;
  location: string;
}

function readPrefill(): Prefill | null {
  const p = new URLSearchParams(window.location.search);
  if (p.get('add') !== '1') return null;
  return {
    company:  p.get('company')  ?? '',
    role:     p.get('role')     ?? '',
    jobUrl:   p.get('url')      ?? '',
    source:   p.get('source')   ?? '',
    location: p.get('location') ?? '',
  };
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [prefill] = useState<Prefill | null>(readPrefill);

  useEffect(() => {
    // Clean URL params so refresh doesn't re-open the modal
    if (prefill) window.history.replaceState({}, '', window.location.pathname);
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setChecking(false);
    });
    return unsub;
  }, []);

  if (checking) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#7a7a8c' }}>
      Loading…
    </div>
  );

  return user
    ? <Dashboard user={user} prefill={prefill} />
    : <Login />;
}
