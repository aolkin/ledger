<script setup lang="ts">
import { diffDays, diffMinutes } from '@formkit/tempo'
import LedgerMetaEditor from '~/components/LedgerMetaEditor.vue'
import { useQueryLedger } from '../composables/queries'

useHead({
  title: 'Ledgers',
})
definePageMeta({
  title: 'Ledgers',
})

const ledgerQuery = useQueryLedger()
onMounted(() => ledgerQuery.refetch())

const expandedRows = ref<Record<string, boolean>>({})

const adding = ref(false)

const now = useNow({ interval: 30 * 1000 })

function timeLeft(date: Date): string {
  const minutesUntil = diffMinutes(date, now.value)
  if (minutesUntil > 0) {
    if (minutesUntil > 60 * 24) {
      const daysLeft = diffDays(date, now.value)
      return `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`
    }
    return 'Almost done!'
  } else if (minutesUntil > -60 * 24) {
    return 'Done!'
  }
  return ''
}
</script>

<template>
  <QueryLoader :query="ledgerQuery">
    <DataTable
      :value="ledgerQuery.data.value"
      v-model:expanded-rows="expandedRows"
      sort-field="startDate"
      :sort-order="-1"
      data-key="id"
      class="ledger-table"
    >
      <template #empty>
        <div class="p-4 text-center">
          No ledgers available!
          <Button link @click="adding = true">Create one.</Button>
        </div>
      </template>
      <Column expander class="button-column" />
      <Column field="name">
        <template #body="slotProps">
          <Button
            as="router-link"
            :to="{
              name: 'ledger-activities',
              params: { ledger: slotProps.data.id },
            }"
            text
          >
            {{ slotProps.data.name }}
          </Button>
        </template>
      </Column>
      <Column field="endDate">
        <template #body="slotProps">
          {{ timeLeft(slotProps.data.endDate) }}
        </template>
      </Column>
      <template #expansion="slotProps">
        <LedgerMetaEditor
          :ledger="slotProps.data"
          @save="delete expandedRows[slotProps.data.id]"
        />
      </template>
    </DataTable>
    <FloatingPlusButton @click="adding = true" />
    <Dialog
      v-model:visible="adding"
      modal
      header="Create New Ledger"
      dismissable-mask
      class="m-2"
    >
      <LedgerMetaEditor @save="adding = false" />
    </Dialog>
  </QueryLoader>
</template>

<style scoped>
.ledger-table :deep(.button-column) {
  width: calc(var(--p-button-icon-only-width) + 8px);
}

.ledger-table :deep(thead) {
  display: none;
}
</style>
