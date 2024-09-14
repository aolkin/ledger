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
        return format(date, 'h:mm a');
    }
    return format(date, 'hA M/DD');
}

interface TableProps {
    field: string,
    order: number,
    expanded?: number,
}

const tableProps: TableProps = reactive({
    field: 'timestamp',
    order: -1,
    expanded: undefined,
})

const sortBy = (field: string) => {
    if (tableProps.field === field) {
        tableProps.order = -tableProps.order;
    } else {
        tableProps.order = -1;
        tableProps.field = field;
    }
}

const sortIcon = computed(() => {
    return tableProps.order === -1 ? 'pi-sort-amount-down' : 'pi-sort-amount-up-alt';
})

</script>

<template>
  <DataView :value="ledger.entries" :sort-field="tableProps.field" :sort-order="tableProps.order">
    <template #list="slotProps">
      <div class="grid grid-cols-[auto_auto_auto]" v-auto-animate>
        <div class="grid grid-cols-subgrid col-span-3 gap-4 border-y-2
         border-surface-200 dark:border-surface-700 font-bold">
          <div class="truncate">
            Activity
          </div>
          <div class="truncate text-right cursor-pointer" @click="sortBy('timestamp')">
            <i v-if="tableProps.field === 'timestamp'" :class="['pi', sortIcon]"></i>
            Date
          </div>
          <div class="text-right cursor-pointer" @click="sortBy('value')">
            <i v-if="tableProps.field === 'value'" :class="['pi', sortIcon]"></i>
            Points
          </div>
        </div>
        <div v-for="(item, index) in slotProps.items" :key="index"
             class="grid grid-cols-subgrid col-span-3 gap-4 border-b
              border-surface-200 dark:border-surface-700 cursor-pointer"
             @click="tableProps.expanded = tableProps.expanded === index ? undefined : index">
          <div class="overflow-hidden w-full flex gap-1.5">
            <span class="truncate">{{ item.title }}</span>
            <span class="text-slate-500 dark:text-slate-400">x{{ item.multiplier }}</span>
          </div>
          <div class="truncate text-right">
            {{ formatTimestamp(item.timestamp) }}
          </div>
          <div class="text-right">
            {{ item.value }} pts
          </div>
          <div v-if="tableProps.expanded === index" class="col-span-3 mx-2 text-center">
            <div>{{ format(item.timestamp, { date: "medium", time: "medium" }) }}</div>
            <div v-if="item.notes">{{ item.notes }}</div>
          </div>
        </div>
      </div>
    </template>
  </DataView>
</template>

<style scoped>
.grid > .grid {
    padding-top: 0.5rem;
    padding-bottom: 0.75rem;
}

.grid > :nth-child(1):not(.grid) {
    margin-left: 0.5rem;
}

.grid > :nth-child(3):not(.grid) {
    margin-right: 0.5rem;
}
</style>
