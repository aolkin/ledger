<script setup lang="ts">
import { diffMinutes, format, sameDay, diffHours } from '@formkit/tempo'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { LedgerEntry } from '../worker/router-types'

const { ledger } = defineProps<{ ledger: string }>()
const confirm = useConfirm()

const trpc = useTrpc()
const queryClient = useQueryClient()
const ledgerQuery = useQueryEntries(ledger)
const now = useNow({ interval: 30 * 1000 })

const formatTimestamp = (date: Date, long?: boolean): string => {
  const minutesAgo = diffMinutes(now.value, date)
  if (minutesAgo < 1) {
    return 'just now'
  } else if (minutesAgo < 60) {
    return `${minutesAgo} min${minutesAgo > 1 ? 's' : ''}${long ? ' ago' : ''}`
  } else if (minutesAgo < 60 * 24) {
    const hoursAgo = diffHours(now.value, date)
    return `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''}${long ? ' ago' : ''}`
  } else if (sameDay(now.value, date)) {
    return format(date, 'h:mm a')
  } else {
    return format(date, long ? { date: 'medium', time: 'medium' } : 'hA M/DD')
  }
}

interface TableProps {
  field: string
  order: number
  expanded?: string
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

const removeMutation = useMutation({
  mutationFn: async (entryId: string) => {
    await trpc.entry.delete.mutate({ id: entryId, ledgerId: ledger })
    return entryId
  },
  onSuccess: (entryId) => {
    queryClient.setQueryData(
      entriesQueryKey(ledger),
      ledgerQuery.data.value?.filter((item) => item.id !== entryId),
    )
  },
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
      removeMutation.mutate(item.id)
    },
  })
}
</script>

<template>
  <DataView
    :value="ledgerQuery.data.value"
    :sort-field="tableProps.field"
    :sort-order="tableProps.order"
  >
    <template #empty>
      <div class="p-4 text-center">
        No activity recorded!
        <Button
          as="router-link"
          link
          :to="{ name: 'ledger-activities-record' }"
        >
          Record some.
        </Button>
      </div>
    </template>
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
