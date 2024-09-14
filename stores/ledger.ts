export type ObjectId = string;
export type Color = string;

export interface LedgerTemplate {
    id: ObjectId,
    title: string,
    value: number,
    unit: string,
    color?: Color,
    sort?: number,
    notes?: string,
}

export interface LedgerEntry extends Omit<LedgerTemplate, 'sort'> {
    multiplier: number,
    value: number, // Pre-multiplied
    timestamp: Date,
    author: string,
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

// TODO: generate these on the server?
function generateId(): ObjectId {
    return new Date().getTime().toString();
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
        addEntry(template: LedgerTemplate, multiplier: number, author = 'unknown') {
            this.entries.push({
                ...template,
                multiplier,
                value: template.value * multiplier,
                timestamp: new Date(),
                author,
                id: generateId(),
            });
        },
        removeEntry(id: ObjectId) {
            this.entries.splice(this.entries.findIndex(entry => entry.id === id), 1);
        },
        addTemplate(template: Omit<LedgerTemplate, 'sort' | 'id'>): ObjectId {
            let id = generateId()
            this.templates.push({
                ...template,
                sort: this.templates.length,
                id,
            });
            return id;
        },
        removeTemplate(id: ObjectId) {
            this.templates.splice(this.templates.findIndex(entry => entry.id === id), 1);
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
