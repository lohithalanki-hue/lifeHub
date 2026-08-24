import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {ClerkProvider} from '@clerk/clerk-react';
import AuthGate from './AuthGate';
import './index.css';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function MissingClerkConfig() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-6 text-center">
      <div className="max-w-lg rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-white shadow-2xl backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">LifeHub Accounts</p>
        <h1 className="mt-3 text-2xl font-black">Account system needs one setup step</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Add the VITE_CLERK_PUBLISHABLE_KEY environment variable to your Vercel project, then redeploy LifeHub.
        </p>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {publishableKey ? (
      <ClerkProvider publishableKey={publishableKey}>
        <AuthGate />
      </ClerkProvider>
    ) : (
      <MissingClerkConfig />
    )}
  </StrictMode>,
);
