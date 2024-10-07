<script setup lang="ts">
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import LedgerMetaEditor from '~/components/LedgerMetaEditor.vue'

useHead({
  title: 'Ledgers',
})
definePageMeta({
  title: 'Ledgers',
})

const trpc = useTrpc()
const queryClient = useQueryClient()
const route = useRoute()
const confirm = useConfirm()

const ledgerQuery = useQuery({
  queryKey: ['metas'],
  queryFn: () => trpc.ledger.list.query(),
  refetchOnMount: true,
})
const expandedRows = ref<Record<string, boolean>>({})

const adding = ref(false)
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
      <!--    <Column class="button-column">-->
      <!--      <template #body="slotProps">-->
      <!--        <Button-->
      <!--          icon="pi pi-trash"-->
      <!--          severity="danger"-->
      <!--          size="small"-->
      <!--          @click="removeActivity(slotProps.data)"-->
      <!--        />-->
      <!--      </template>-->
      <!--    </Column>-->
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
