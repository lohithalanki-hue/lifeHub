let activeUserId = '';

export function setStorageUserId(userId: string | null | undefined): void {
  activeUserId = userId?.trim() ?? '';
}

export function getScopedStorageKey(key: string): string {
  return activeUserId ? `lifehub_user_${activeUserId}_${key}` : key;
}

export function clearStorageUserId(): void {
  activeUserId = '';
}
