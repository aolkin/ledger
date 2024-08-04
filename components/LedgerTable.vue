<script setup lang="ts">

import { diffMinutes, format, sameDay, sameHour } from "@formkit/tempo"

const ledger = useLedgerStore();

const formatTimestamp = (date: Date): string => {
    const now = new Date();
    if (sameDay(now, date)) {
        const minutesAgo = diffMinutes(now, date)
        if (minutesAgo < 1) {
            return 'just now'
        } else if (minutesAgo < 60) {
            return `${minutesAgo} min${minutesAgo > 1 ? 's' : ''}`;
        }
        return format(date, { time: 'short' });
    }
    return format(date, 'M/D HH:mm');
}

</script>

<template>
  <DataTable :value="ledger.entries" sort-field="timestamp" :sort-order="-1">
    <Column field="title" header="Title" sortable>
      <template #body="slotProps">
        {{ slotProps.data.title }}
        <span class="text-slate-500 dark:text-slate-400">x{{ slotProps.data.multiplier }}</span>
      </template>
    </Column>
    <Column field="multiplier" hidden>
      <template #body="slotProps">
        x{{ slotProps.data.multiplier }}
      </template>
    </Column>
    <Column field="timestamp" header="Date" sortable>
      <template #body="slotProps">
        {{ formatTimestamp(slotProps.data.timestamp) }}
      </template>
    </Column>
    <Column field="value" header="Points" sortable>
      <template #body="slotProps">
        <div class="text-right">
        {{ slotProps.data.value }} pts
        </div>
      </template>
    </Column>
  </DataTable>
</template>

<style scoped>

</style>
