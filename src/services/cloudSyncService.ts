const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

const TABLE = 'lifehub_user_data';
const LOCAL_PREFIX = 'lifehub_user_';

type TokenGetter = (options?: { template?: string }) => Promise<string | null>;

function isConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

function localPrefixForUser(userId: string) {
  return `${LOCAL_PREFIX}${userId}_lifehub_`;
}

function collectLocalData(userId: string): Record<string, unknown> {
  const physicalPrefix = localPrefixForUser(userId);
  const data: Record<string, unknown> = {};

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const physicalKey = window.localStorage.key(i);
    if (!physicalKey || !physicalKey.startsWith(physicalPrefix)) continue;

    // AuthGate scopes getItem/setItem. Read through the logical key so the
    // scoped wrapper resolves it to the physical user-specific key exactly once.
    const logicalKey = `lifehub_${physicalKey.slice(physicalPrefix.length)}`;
    const raw = window.localStorage.getItem(logicalKey);
    if (raw === null) continue;
    try { data[logicalKey] = JSON.parse(raw); }
    catch { data[logicalKey] = raw; }
  }
  return data;
}

function restoreLocalData(userId: string, data: Record<string, unknown>) {
  const physicalPrefix = localPrefixForUser(userId);

  for (let i = window.localStorage.length - 1; i >= 0; i -= 1) {
    const physicalKey = window.localStorage.key(i);
    if (!physicalKey?.startsWith(physicalPrefix)) continue;
    const logicalKey = `lifehub_${physicalKey.slice(physicalPrefix.length)}`;
    window.localStorage.removeItem(logicalKey);
  }

  Object.entries(data).forEach(([key, value]) => {
    const logicalKey = key.startsWith('lifehub_') ? key : `lifehub_${key}`;
    window.localStorage.setItem(logicalKey, JSON.stringify(value));
  });
}

async function request(path: string, token: string, init: RequestInit = {}) {
  if (!isConfigured()) throw new Error('Supabase environment variables are not configured.');
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY!,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Supabase request failed (${response.status}): ${body || response.statusText}`);
  }
  return response;
}

async function getSupabaseToken(getToken: TokenGetter) {
  try { return await getToken({ template: 'supabase' }); }
  catch { return await getToken(); }
}

export async function initializeCloudSync(userId: string, getToken: TokenGetter) {
  if (!isConfigured()) return { enabled: false, source: 'local' as const };
  const token = await getSupabaseToken(getToken);
  if (!token) throw new Error('No Clerk session token available for Supabase.');

  const encodedUserId = encodeURIComponent(userId);
  const response = await request(`${TABLE}?select=data&user_id=eq.${encodedUserId}&limit=1`, token, { method: 'GET' });
  const rows = await response.json() as Array<{ data: Record<string, unknown> }>;

  if (rows.length > 0 && rows[0]?.data) {
    restoreLocalData(userId, rows[0].data);
    return { enabled: true, source: 'cloud' as const };
  }

  await saveCloudData(userId, getToken);
  return { enabled: true, source: 'local' as const };
}

export async function saveCloudData(userId: string, getToken: TokenGetter) {
  if (!isConfigured()) return;
  const token = await getSupabaseToken(getToken);
  if (!token) return;

  await request(TABLE, token, {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      user_id: userId,
      data: collectLocalData(userId),
      updated_at: new Date().toISOString(),
    }),
  });
}

export function isCloudSyncConfigured() {
  return isConfigured();
}
