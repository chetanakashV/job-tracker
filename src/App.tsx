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

// Detect source name from URL domain
function detectSource(url: string): string {
  if (url.includes('linkedin.com'))   return 'LinkedIn';
  if (url.includes('naukri.com'))     return 'Naukri';
  if (url.includes('instahyre.com'))  return 'Instahyre';
  if (url.includes('indeed.com'))     return 'Indeed';
  if (url.includes('glassdoor.'))     return 'Glassdoor';
  if (url.includes('wellfound.com') || url.includes('angel.co')) return 'AngelList';
  if (url.includes('unstop.com'))     return 'Unstop';
  if (url.includes('hirist.tech') || url.includes('hirist.com')) return 'Hirist';
  if (url.includes('internshala.com')) return 'Internshala';
  if (url.includes('foundit.in') || url.includes('monster.')) return 'Foundit';
  return 'Other';
}

// Parse role + company from page title
// Handles: "Role | Company | Platform", "Role at Company", "Company hiring Role", "Role - Company"
function parseTitle(title: string): { role: string; company: string } {
  if (!title) return { role: '', company: '' };

  // "Role | Company | ..." (LinkedIn, Naukri, most modern platforms)
  let m = title.match(/^([^|]+?)\s*\|\s*([^|]+?)\s*\|/);
  if (m) return { role: m[1].trim(), company: m[2].trim() };

  // "Role | Company" (only two pipe segments)
  m = title.match(/^([^|]+?)\s*\|\s*([^|]+?)$/);
  if (m) return { role: m[1].trim(), company: m[2].trim() };

  // "Role at Company ..." (Indeed, Glassdoor, Wellfound)
  m = title.match(/^(.+?)\s+at\s+(.+?)(?:\s*[|\-–]|$)/i);
  if (m) return { role: m[1].trim(), company: m[2].trim() };

  // "Company hiring Role ..." (LinkedIn feed)
  m = title.match(/^(.+?)\s+(?:is\s+)?hiring\s+(.+?)(?:\s*[|]|$)/i);
  if (m) return { role: m[2].trim(), company: m[1].trim() };

  // "Role - Company - ..." (some ATS portals)
  m = title.match(/^([^-]+?)\s*-\s*([^-|]+?)(?:\s*[-|]|$)/);
  if (m) return { role: m[1].trim(), company: m[2].trim() };

  return { role: '', company: '' };
}

function readPrefill(): Prefill | null {
  const p = new URLSearchParams(window.location.search);

  // DEBUG — remove after confirming share target params
  if (p.toString()) {
    setTimeout(() => alert('[DEBUG] URL params:\n' + window.location.search), 300);
  }

  // Bookmarklet flow: ?add=1&company=...&role=...
  if (p.get('add') === '1') {
    return {
      company:  p.get('company')  ?? '',
      role:     p.get('role')     ?? '',
      jobUrl:   p.get('url')      ?? '',
      source:   p.get('source')   ?? '',
      location: p.get('location') ?? '',
    };
  }

  // PWA Share Target flow: ?shared_url=...&shared_title=...
  const sharedUrl   = p.get('shared_url')   ?? '';
  const sharedTitle = p.get('shared_title') ?? '';
  if (sharedUrl || sharedTitle) {
    const { role, company } = parseTitle(sharedTitle);
    const source = detectSource(sharedUrl);
    return { company, role, jobUrl: sharedUrl, source, location: '' };
  }

  return null;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [prefill] = useState<Prefill | null>(readPrefill);

  useEffect(() => {
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
