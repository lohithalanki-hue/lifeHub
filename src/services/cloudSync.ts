import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const CLOUD_TABLE = 'lifehub_user_data';
const LOCAL_PREFIX = 'lifehub_';
const SYNC_DEBOUNCE_MS = 900;

type TokenGetter = () => Promise<string | null>;

let client: SupabaseClient | null = null;
let activeUserId = '';
let getToken: TokenGetter | null = null;
let syncTimer: number | null = null;
let isApplyingCloudData = false;
let initialized = false;

function getSupabaseClient(tokenGetter: TokenGetter): SupabaseClient | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  if (!url || !key) return null;

  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        headers: { 'x-client-info': 'lifehub' },
      },
      accessToken: async () => {
        try {
          // Supabase's Clerk integration commonly uses a Clerk JWT template named "supabase".
          return await tokenGetter();
        } catch {
          return null;
        }
      },
    });
  }

  return client;
}

function readLocalSnapshot(): Record<string, unknown> {
  const snapshot: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(LOCAL_PREFIX)) continue;
    const raw = localStorage.getItem(key);
    if (raw === null) continue;
    try {
      snapshot[key] = JSON.parse(raw);
    } catch {
      snapshot[key] = raw;
    }
  }
  return snapshot;
}

function applySnapshot(snapshot: Record<string, unknown>): void {
  isApplyingCloudData = true;
  try {
    for (const [key, value] of Object.entries(snapshot)) {
      if (!key.startsWith(LOCAL_PREFIX)) continue;
      localStorage.setItem(key, JSON.stringify(value));
    }
  } finally {
    isApplyingCloudData = false;
  }
}

export async function syncLifeHubToCloud(): Promise<void> {
  if (!activeUserId || !getToken || isApplyingCloudData) return;
  const supabase = getSupabaseClient(getToken);
  if (!supabase) return;

  const { error } = await supabase
    .from(CLOUD_TABLE)
    .upsert(
      {
        user_id: activeUserId,
        data: readLocalSnapshot(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

  if (error) {
    console.error('[LifeHub] Cloud save failed:', error.message);
  }
}

function scheduleSync(): void {
  if (!activeUserId || !initialized || isApplyingCloudData) return;
  if (syncTimer !== null) window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(() => {
    syncTimer = null;
    void syncLifeHubToCloud();
  }, SYNC_DEBOUNCE_MS);
}

export async function initializeLifeHubCloudSync(userId: string, tokenGetter: TokenGetter): Promise<void> {
  activeUserId = userId;
  getToken = tokenGetter;
  initialized = false;

  const supabase = getSupabaseClient(tokenGetter);
  if (!supabase) {
    initialized = true;
    return;
  }

  const { data, error } = await supabase
    .from(CLOUD_TABLE)
    .select('data, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[LifeHub] Cloud load failed:', error.message);
    initialized = true;
    return;
  }

  if (data?.data && typeof data.data === 'object') {
    applySnapshot(data.data as Record<string, unknown>);
  } else {
    // First cloud login: preserve the user's current browser data by uploading it.
    await syncLifeHubToCloud();
  }

  initialized = true;
}

export function startLifeHubCloudSyncWatcher(): () => void {
  const storage = window.localStorage;
  const originalSetItem = storage.setItem.bind(storage);
  const originalRemoveItem = storage.removeItem.bind(storage);

  storage.setItem = (key: string, value: string) => {
    originalSetItem(key, value);
    if (key.startsWith(LOCAL_PREFIX)) scheduleSync();
  };

  storage.removeItem = (key: string) => {
    originalRemoveItem(key);
    if (key.startsWith(LOCAL_PREFIX)) scheduleSync();
  };

  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') void syncLifeHubToCloud();
  };
  window.addEventListener('visibilitychange', onVisibilityChange);

  return () => {
    storage.setItem = originalSetItem;
    storage.removeItem = originalRemoveItem;
    window.removeEventListener('visibilitychange', onVisibilityChange);
    if (syncTimer !== null) window.clearTimeout(syncTimer);
    syncTimer = null;
  };
}
