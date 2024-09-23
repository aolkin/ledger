<script setup lang="ts">
import { diffMinutes, format, sameDay, sameHour } from '@formkit/tempo'
import type { LedgerEntry, ObjectId } from '../stores/ledger'

const ledger = useLedgerStore()
const confirm = useConfirm()

const formatTimestamp = (date: Date, long?: boolean): string => {
  const now = new Date()
  if (sameDay(now, date)) {
    const minutesAgo = diffMinutes(now, date)
    if (minutesAgo < 1) {
      return 'just now'
    } else if (minutesAgo < 60) {
      return `${minutesAgo} min${minutesAgo > 1 ? 's' : ''}${long ? ' ago' : ''}`
    }
    return format(date, 'h:mm a')
  }
  return format(date, long ? { date: 'medium', time: 'medium' } : 'hA M/DD')
}

interface TableProps {
  field: string
  order: number
  expanded?: ObjectId
}

const tableProps: TableProps = reactive({
  field: 'timestamp',
  order: -1,
  expanded: undefined,
})

const sortBy = (field: string) => {
  tableProps.expanded = undefined
  if (tableProps.field === field) {
    tableProps.order = -tableProps.order
  } else {
    tableProps.order = -1
    tableProps.field = field
  }
}

const sortIcon = computed(() => {
  return tableProps.order === -1
    ? 'pi-sort-amount-down'
    : 'pi-sort-amount-up-alt'
})

const removeEntry = (item: LedgerEntry) => {
  confirm.require({
    message: `Are you sure you want to delete ${item.title} from ${formatTimestamp(item.timestamp, true)}?`,
    header: 'Delete Entry',
    icon: 'pi pi-trash',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Delete',
      severity: 'danger',
    },
    accept: () => {
      ledger.removeEntry(item.id)
    },
  })
}
</script>

<template>
  <DataView
    :value="ledger.entries"
    :sort-field="tableProps.field"
    :sort-order="tableProps.order"
  >
    <template #list="slotProps">
      <div class="grid grid-cols-[auto_auto_auto]">
        <div
          class="grid grid-cols-subgrid col-span-3 gap-4 border-y-2 border-surface-200 dark:border-surface-700 font-bold row"
        >
          <div class="truncate">Activity</div>
          <div
            class="truncate text-right cursor-pointer"
            @click="sortBy('timestamp')"
          >
            <i
              v-if="tableProps.field === 'timestamp'"
              :class="['pi', sortIcon]"
            ></i>
            Date
          </div>
          <div class="text-right cursor-pointer" @click="sortBy('value')">
            <i
              v-if="tableProps.field === 'value'"
              :class="['pi', sortIcon]"
            ></i>
            Points
          </div>
        </div>
        <div
          v-for="(item, index) in slotProps.items"
          :key="index"
          class="grid grid-cols-subgrid col-span-3 gap-4 border-b row border-surface-200 dark:border-surface-700"
          v-auto-animate
        >
          <div
            class="grid grid-cols-subgrid col-span-3 cursor-pointer"
            @click="
              tableProps.expanded =
                tableProps.expanded === item.id ? undefined : item.id
            "
          >
            <div class="overflow-hidden w-full flex gap-1.5">
              <span class="truncate">{{ item.title }}</span>
              <span class="text-slate-500 dark:text-slate-400"
                >x{{ item.multiplier }}</span
              >
            </div>
            <div class="truncate text-right">
              {{ formatTimestamp(item.timestamp) }}
            </div>
            <div class="text-right">{{ item.value }} pts</div>
          </div>
          <div
            v-if="tableProps.expanded === item.id"
            class="col-span-3 mx-2 text-center"
          >
            <div class="flex gap-4 w-full justify-between">
              <div>
                {{ item.multiplier }}
                {{ item.unit + (item.multiplier === 1 ? '' : 's') }}
              </div>
              <div>
                {{ format(item.timestamp, { date: 'medium', time: 'medium' }) }}
              </div>
              <div>
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  size="small"
                  @click="removeEntry(item)"
                />
              </div>
            </div>
            <div v-if="item.notes">{{ item.notes }}</div>
          </div>
        </div>
      </div>
    </template>
  </DataView>
</template>

<style scoped>
.row {
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
