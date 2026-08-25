import { useEffect, useState } from 'react';
import { SignIn, SignUp, SignedIn, SignedOut, UserButton, useSession, useUser } from '@clerk/clerk-react';
import App from './App';
import { initializeCloudSync, saveCloudData } from './services/cloudSyncService';

let activeLifeHubUserId = '';
let storageScoped = false;

function scopeLifeHubStorage(userId: string) {
  activeLifeHubUserId = userId;
  if (storageScoped) return;
  const storage = window.localStorage;
  const originalGetItem = storage.getItem.bind(storage);
  const originalSetItem = storage.setItem.bind(storage);
  const originalRemoveItem = storage.removeItem.bind(storage);
  const keyForUser = (key: string) => key.startsWith('lifehub_') && activeLifeHubUserId ? `lifehub_user_${activeLifeHubUserId}_${key}` : key;
  storage.getItem = (key: string) => originalGetItem(keyForUser(key));
  storage.setItem = (key: string, value: string) => originalSetItem(keyForUser(key), value);
  storage.removeItem = (key: string) => originalRemoveItem(keyForUser(key));
  storageScoped = true;
}

function AccountRequired() {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 text-center"><p className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">LifeHub</p><h1 className="mt-2 text-2xl font-black text-white">{mode === 'sign-in' ? 'Welcome back' : 'Create your LifeHub account'}</h1><p className="mt-2 text-sm text-slate-400">{mode === 'sign-in' ? 'Sign in to access your personal LifeHub.' : 'Your exams, goals, diary and progress will stay tied to your account.'}</p></div>
        {mode === 'sign-in' ? <SignIn routing="hash" /> : <SignUp routing="hash" />}
        <button type="button" onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')} className="mt-5 w-full text-sm font-semibold text-slate-300 hover:text-white transition">{mode === 'sign-in' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}</button>
      </div>
    </div>
  );
}

function CloudSyncBootstrap({ userId, children }: { userId: string; children: React.ReactNode }) {
  const { session } = useSession();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const getToken = (options?: { template?: string }) => session?.getToken(options) ?? Promise.resolve(null);
    initializeCloudSync(userId, getToken)
      .then(() => { if (!cancelled) setReady(true); })
      .catch((err) => {
        console.error('LifeHub cloud sync initialization failed:', err);
        if (!cancelled) { setError('Cloud sync could not be reached. Your local data is still safe.'); setReady(true); }
      });
    return () => { cancelled = true; };
  }, [session, userId]);

  useEffect(() => {
    if (!ready || !session) return;
    const getToken = (options?: { template?: string }) => session.getToken(options);
    let lastSnapshot = '';

    const sync = async () => {
      try {
        const physicalPrefix = `lifehub_user_${userId}_lifehub_`;
        const snapshot: Record<string, string | null> = {};
        for (let i = 0; i < window.localStorage.length; i += 1) {
          const physicalKey = window.localStorage.key(i);
          if (!physicalKey?.startsWith(physicalPrefix)) continue;
          const logicalKey = `lifehub_${physicalKey.slice(physicalPrefix.length)}`;
          snapshot[logicalKey] = window.localStorage.getItem(logicalKey);
        }
        const serialized = JSON.stringify(snapshot);
        if (serialized === lastSnapshot) return;
        await saveCloudData(userId, getToken);
        lastSnapshot = serialized;
      } catch (err) {
        console.error('LifeHub background cloud sync failed:', err);
      }
    };

    void sync();
    const interval = window.setInterval(() => void sync(), 3000);
    const onVisibilityChange = () => { if (document.visibilityState === 'hidden') void sync(); };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => { window.clearInterval(interval); document.removeEventListener('visibilitychange', onVisibilityChange); };
  }, [ready, session, userId]);

  if (!ready) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300 text-sm">Syncing your LifeHub data...</div>;
  return <>{error && <div className="fixed left-1/2 top-4 z-[200] -translate-x-1/2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs font-semibold text-amber-200 backdrop-blur-xl">{error}</div>}{children}</>;
}

function SignedInLifeHub() {
  const { user, isLoaded } = useUser();

  // Scope storage synchronously before CloudSyncBootstrap/App render. Previously this
  // happened in an effect, allowing cloud initialization to run against unscoped keys.
  if (isLoaded && user?.id) scopeLifeHubStorage(user.id);

  if (!isLoaded || !user?.id) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300 text-sm">Loading your LifeHub account...</div>;
  return <CloudSyncBootstrap userId={user.id}><div className="fixed right-5 top-5 z-[100] rounded-full border border-white/10 bg-black/20 p-1.5 shadow-lg backdrop-blur-xl"><UserButton afterSignOutUrl="/" /></div><App /></CloudSyncBootstrap>;
}

export default function AuthGate() {
  return <><SignedOut><AccountRequired /></SignedOut><SignedIn><SignedInLifeHub /></SignedIn></>;
}
