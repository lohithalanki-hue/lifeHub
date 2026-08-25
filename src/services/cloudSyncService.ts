import { createLifeHubSupabaseClient } from '../lib/supabase';

type TokenGetter = () => Promise<string | null>;

const TABLE = 'lifehub_user_data';
const PHYSICAL_PREFIX = 'lifehub_user_';

function localPrefixForUser(userId: string) {
  return `${PHYSICAL_PREFIX}${userId}_lifehub_`;
}

// AuthGate namespaces LifeHub's localStorage keys. Use the native Storage prototype
// here so we can read/write the physical keys without getting caught by that namespace wrapper.
function nativeGet(key: string) {
  return Storage.prototype.getItem.call(window.localStorage, key);
}

function nativeSet(key: string, value: string) {
  Storage.prototype.setItem.call(window.localStorage, key, value);
}

function nativeRemove(key: string) {
  Storage.prototype.removeItem.call(window.localStorage, key);
}

function collectLocalData(userId: string): Record<string, unknown> {
  const prefix = localPrefixForUser(userId);
  const data: Record<string, unknown> = {};

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const physicalKey = window.localStorage.key(i);
    if (!physicalKey?.startsWith(prefix)) continue;
    const raw = nativeGet(physicalKey);
    if (raw === null) continue;
    const logicalKey = `lifehub_${physicalKey.slice(prefix.length)}`;
    try { data[logicalKey] = JSON.parse(raw); }
    catch { data[logicalKey] = raw; }
  }
  return data;
}

function restoreLocalData(userId: string, data: Record<string, unknown>) {
  const prefix = localPrefixForUser(userId);
  const keysToRemove: string[] = [];

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const physicalKey = window.localStorage.key(i);
    if (physicalKey?.startsWith(prefix)) keysToRemove.push(physicalKey);
  }
  keysToRemove.forEach(nativeRemove);

  Object.entries(data).forEach(([logicalKey, value]) => {
    const suffix = logicalKey.startsWith('lifehub_') ? logicalKey.slice('lifehub_'.length) : logicalKey;
    nativeSet(`${prefix}${suffix}`, JSON.stringify(value));
  });
}

function clientFor(getToken: TokenGetter) {
  return createLifeHubSupabaseClient(getToken);
}

export async function initializeCloudSync(userId: string, getToken: TokenGetter) {
  const supabase = clientFor(getToken);
  if (!supabase) return { enabled: false, source: 'local' as const };

  const localData = collectLocalData(userId);
  const { data: row, error } = await supabase
    .from(TABLE)
    .select('data')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

  const cloudData = (row?.data ?? {}) as Record<string, unknown>;
  if (Object.keys(cloudData).length === 0) {
    if (Object.keys(localData).length > 0) {
      await saveCloudData(userId, getToken);
      return { enabled: true, source: 'local' as const };
    }
    return { enabled: true, source: 'empty' as const };
  }

  restoreLocalData(userId, cloudData);
  return { enabled: true, source: 'cloud' as const };
}

export async function saveCloudData(userId: string, getToken: TokenGetter) {
  const supabase = clientFor(getToken);
  if (!supabase) return;

  const data = collectLocalData(userId);
  if (Object.keys(data).length === 0) return;

  const { error } = await supabase
    .from(TABLE)
    .upsert(
      { user_id: userId, data, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    );

  if (error) throw error;
}

export function isCloudSyncConfigured() {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  );
}
