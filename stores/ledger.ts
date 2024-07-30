interface LedgerEntry {
    title: string,
    multiplier: number,
    value: number, // Pre-multiplied
    timestamp: Date,
}

interface LedgerState {
    entries: LedgerEntry[];
}

function sumEntries(entries: LedgerEntry[]): number {
    return entries.reduce((acc, entry) => acc + entry.value, 0);
}

function isSameDay(a: Date, b: Date): boolean {
    return a.getDate() === b.getDate()
        && a.getMonth() === b.getMonth()
        && a.getFullYear() === b.getFullYear();
}

export const useLedgerStore = defineStore('ledger', {
    state: (): LedgerState => ({ entries: [] }),
    getters: {
        total: (state: LedgerState) => sumEntries(state.entries),
        today: (state: LedgerState) => {
            const now = new Date();
            return sumEntries(state.entries.filter(entry => isSameDay(now, entry.timestamp)));
        }
    },
    actions: {
        addEntry(title: string, multiplier: number, value: number) {
            this.entries.push({ title, multiplier, value, timestamp: new Date() });
        },
        deleteEntry(id: number) {
            this.entries.splice(id, 1);
        }
    }
})
