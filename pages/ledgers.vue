<script setup lang="ts">
import type { DataTableRowReorderEvent } from 'primevue/datatable'
import type { LedgerTemplate } from '../stores/ledger'

useHead({
  title: 'Ledgers',
})

const route = useRoute()
const ledger = useLedgerStore()
const confirm = useConfirm()

const expandedRows = ref<Record<string, boolean>>({})
</script>

<template>
  <DataTable
    :value="ledger.templates"
    @row-reorder="onReorder"
    v-model:expanded-rows="expandedRows"
    sort-field="sort"
    :sort-order="-1"
    data-key="id"
    class="activity-table"
  >
    <Column row-reorder class="button-column" />
    <Column expander class="button-column" />
    <Column field="title">
      <template #body="slotProps">
        <div
          class="cursor-pointer"
          @click="
            expandedRows = expandedRows[slotProps.data.id]
              ? {}
              : { [slotProps.data.id]: true }
          "
        >
          {{ slotProps.data.title }}
        </div>
      </template>
    </Column>
    <Column class="button-column">
      <template #body="slotProps">
        <Button
          icon="pi pi-trash"
          severity="danger"
          size="small"
          @click="removeActivity(slotProps.data)"
        />
      </template>
    </Column>
    <template #expansion="slotProps">
      <ActivityEditor :template="slotProps.data" />
    </template>
  </DataTable>
  <FloatingPlusButton @click="addActivity" />
</template>

<style scoped>
.activity-table :deep(.button-column) {
  width: calc(var(--p-button-icon-only-width) + 8px);
}

.activity-table :deep(thead) {
  display: none;
}
</style>
