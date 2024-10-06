export type ObjectId = string
export type Color = string

export interface LedgerMeta {
  id: ObjectId
  name: string
  startDate: Date
  endDate: Date
}

export interface LedgerTemplate {
  id: ObjectId
  title: string
  value: number
  unit: string
  group: string
  color?: Color
  notes?: string
}

export interface LedgerEntry extends LedgerTemplate {
  multiplier: number
  value: number // Pre-multiplied
  timestamp: Date
  author: string
}

interface LedgerState {
  ledgerMeta: LedgerMeta | undefined
  entryData: Record<ObjectId, LedgerEntry>
  templateData: Record<ObjectId, LedgerTemplate>
}

function sumEntries(entries: LedgerEntry[]): number {
  return entries.reduce((acc, entry) => acc + entry.value, 0)
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  )
}

function parseTimestamps(key: string, value: string) {
  if (key === 'timestamp') {
    return new Date(value)
  }
  return value
}

// TODO: generate these on the server?
function _generateId(): ObjectId {
  return new Date().getTime().toString(16)
}

function generateId(existing: Record<ObjectId, unknown>): ObjectId {
  let id = _generateId()
  while (id in [existing]) {
    id = _generateId()
  }
  return id
}

export const useLedgerStore = defineStore('ledger', {
  state: (): LedgerState => {
    return { ledgerMeta: undefined, entryData: {}, templateData: {} }
  },
  getters: {
    entries: (state: LedgerState): LedgerEntry[] =>
      Object.values(state.entryData),
    templates: (state: LedgerState): LedgerTemplate[] =>
      Object.values(state.templateData),
    total(): number {
      return sumEntries(this.entries)
    },
    today(): number {
      const now = new Date()
      return sumEntries(
        this.entries.filter((entry) => isSameDay(now, entry.timestamp)),
      )
    },
  },
  actions: {
    addEntry(
      template: LedgerTemplate,
      multiplier: number,
      author = 'unknown',
    ): ObjectId {
      const id = generateId(this.entryData)
      this.entryData[id] = {
        ...template,
        multiplier,
        value: template.value * multiplier,
        timestamp: new Date(),
        author,
        id,
      }
      return id
    },
    removeEntry(id: ObjectId) {
      delete this.entryData[id]
    },
    addTemplate(template: Omit<LedgerTemplate, 'sort' | 'id'>): ObjectId {
      let id = generateId(this.templateData)
      this.templateData[id] = {
        ...template,
        id,
      }
      return id
    },
    removeTemplate(id: ObjectId) {
      delete this.templateData[id]
    },
    updateTemplate(id: ObjectId, template: Partial<LedgerTemplate>) {
      this.templateData[id] = {
        ...this.templateData[id],
        ...template,
      }
    },
  },
  persist: {
    serializer: {
      deserialize: (value: string): LedgerState =>
        JSON.parse(value, parseTimestamps),
      serialize: JSON.stringify,
    },
  },
})
