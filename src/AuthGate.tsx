import { useMemo, useState } from 'react';
import { SignIn, SignUp, SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react';
import App from './App';

let activeLifeHubUserId = '';
let storageScoped = false;

function scopeLifeHubStorage(userId: string) {
  activeLifeHubUserId = userId;
  if (storageScoped) return;

  const storage = window.localStorage;
  const originalGetItem = storage.getItem.bind(storage);
  const originalSetItem = storage.setItem.bind(storage);
  const originalRemoveItem = storage.removeItem.bind(storage);

  const keyForUser = (key: string) =>
    key.startsWith('lifehub_') && activeLifeHubUserId
      ? `lifehub_user_${activeLifeHubUserId}_${key}`
      : key;

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
        <div className="mb-6 text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">LifeHub</p>
          <h1 className="mt-2 text-2xl font-black text-white">
            {mode === 'sign-in' ? 'Welcome back' : 'Create your LifeHub account'}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {mode === 'sign-in'
              ? 'Sign in to access your personal LifeHub.'
              : 'Your exams, goals, diary and progress will stay tied to your account.'}
          </p>
        </div>

        {mode === 'sign-in' ? (
          <SignIn routing="hash" />
        ) : (
          <SignUp routing="hash" />
        )}

        <button
          type="button"
          onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}
          className="mt-5 w-full text-sm font-semibold text-slate-300 hover:text-white transition"
        >
          {mode === 'sign-in' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}

function SignedInLifeHub() {
  const { user, isLoaded } = useUser();

  useMemo(() => {
    if (isLoaded && user?.id) scopeLifeHubStorage(user.id);
  }, [isLoaded, user?.id]);

  if (!isLoaded || !user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300 text-sm">
        Loading your LifeHub account...
      </div>
    );
  }

  return (
    <>
      <div className="fixed right-5 top-5 z-[100] rounded-full border border-white/10 bg-black/20 p-1.5 shadow-lg backdrop-blur-xl">
        <UserButton afterSignOutUrl="/" />
      </div>
      <App />
    </>
  );
}

export default function AuthGate() {
  return (
    <>
      <SignedOut>
        <AccountRequired />
      </SignedOut>
      <SignedIn>
        <SignedInLifeHub />
      </SignedIn>
    </>
  );
}
