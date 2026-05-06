const PREFIX = 'insightpro_'

export const DB_KEYS = {
  data: `${PREFIX}data`,
  produtos: `${PREFIX}produtos`,
  swot: `${PREFIX}swot`,
  gut: `${PREFIX}gut`,
  pest: `${PREFIX}pest`,
  metas: `${PREFIX}metas`,
  campanhas: `${PREFIX}campanhas`,
  pipeline: `${PREFIX}pipeline`,
  relatorios: `${PREFIX}relatorios`,
  seedVersion: `${PREFIX}seed_version`,
} as const

export const localDB = {
  get<T = unknown>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : null
    } catch {
      return null
    }
  },

  set<T = unknown>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data))
  },

  remove(key: string): void {
    localStorage.removeItem(key)
  },

  has(key: string): boolean {
    return localStorage.getItem(key) !== null
  },

  list<T extends { id: string }>(key: string): T[] {
    return this.get<T[]>(key) ?? []
  },

  add<T extends { id: string }>(key: string, item: T): T[] {
    const items = this.list<T>(key)
    items.push(item)
    this.set(key, items)
    return items
  },

  update<T extends { id: string }>(key: string, id: string, updates: Partial<T>): T[] {
    const items = this.list<T>(key).map(item =>
      item.id === id ? { ...item, ...updates } : item,
    )
    this.set(key, items)
    return items
  },

  patch<T extends { id: string }>(key: string, id: string, patch: Partial<T>): T[] {
    return this.update(key, id, patch)
  },

  delete<T extends { id: string }>(key: string, id: string): T[] {
    const items = this.list<T>(key).filter(item => item.id !== id)
    this.set(key, items)
    return items
  },

  replaceAll<T extends { id: string }>(key: string, items: T[]): T[] {
    this.set(key, items)
    return items
  },

  clearAll(): void {
    Object.values(DB_KEYS).forEach(key => localStorage.removeItem(key))
  },
}
