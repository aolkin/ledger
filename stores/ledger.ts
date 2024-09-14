export interface LedgerEntry {
    title: string,
    multiplier: number,
    value: number, // Pre-multiplied
    timestamp: Date,
    author: string,
    notes?: string,
}

export interface LedgerTemplate {
    title: string,
    value: number,
    unit: string,
    notes?: string,
}

interface LedgerState {
    entries: LedgerEntry[];
    templates: LedgerTemplate[];
}

function sumEntries(entries: LedgerEntry[]): number {
    return entries.reduce((acc, entry) => acc + entry.value, 0);
}

function isSameDay(a: Date, b: Date): boolean {
    return a.getDate() === b.getDate()
        && a.getMonth() === b.getMonth()
        && a.getFullYear() === b.getFullYear();
}

function parseTimestamps(key: string, value: string) {
    if (key === 'timestamp') {
        return new Date(value);
    }
    return value;
}

export const useLedgerStore = defineStore('ledger', {
    state: (): LedgerState => {
        return ({ entries: [], templates: [] })
    },
    getters: {
        total: (state: LedgerState) => sumEntries(state.entries),
        today: (state: LedgerState) => {
            const now = new Date();
            return sumEntries(state.entries.filter(entry => isSameDay(now, entry.timestamp)));
        }
    },
    actions: {
        addEntry(title: string, multiplier: number, value: number, author = 'unknown') {
            this.entries.push({ title, multiplier, value: value * multiplier, timestamp: new Date(), author });
        },
        deleteEntry(id: number) {
            this.entries.splice(id, 1);
        },
        addTemplate(title: string, value: number, unit: string, notes?: string) {
            this.templates.push({ title, value, unit, notes });
        }
    },
    persist: {
        serializer: {
            deserialize(value: string): LedgerEntry {
                return JSON.parse(value, parseTimestamps);
            },
            serialize: JSON.stringify,
        },
    },
})
