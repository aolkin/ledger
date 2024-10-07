<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import LoadingBars from '../components/LoadingBars.vue'
import type { CreateLedgerInput } from '../worker/router-types'

useHead({
  title: 'Ledgers',
})

const trpc = useTrpc()
const queryClient = useQueryClient()
const route = useRoute()
const confirm = useConfirm()

const {
  isPending,
  isError: metaError,
  isSuccess,
  data: ledgers,
} = useQuery({
  queryKey: ['metas'],
  queryFn: () => trpc.ledger.list.query(),
  refetchOnMount: true,
})

const expandedRows = ref<Record<string, boolean>>({})

const addMutation = useMutation({
  mutationFn: async (data: CreateLedgerInput) =>
    trpc.ledger.create.mutate(data),
  onSuccess: (data) => {
    console.log(data)
    queryClient.setQueryData(['metas'], [...(ledgers.value ?? []), data])
  },
})

function addLedger() {
  addMutation.mutate({
    name: 'Default',
    startDate: new Date(),
    endDate: new Date(),
  })
}
</script>

<template>
  <LoadingBars v-if="isPending" />
  <div v-else-if="metaError">Error!</div>
  <DataTable
    v-else
    :value="ledgers"
    v-model:expanded-rows="expandedRows"
    sort-field="startDate"
    :sort-order="-1"
    data-key="id"
    class="ledger-table"
  >
    <Column expander class="button-column" />
    <Column field="name">
      <template #body="slotProps">
        <Button
          as="router-link"
          :to="{ name: 'ledger', params: { ledger: slotProps.data.id } }"
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
      {{ slotProps.data.startDate }}
      {{ slotProps.data.endDate }}
    </template>
  </DataTable>
  <FloatingPlusButton @click="addLedger" v-if="isSuccess" />
</template>

<style scoped>
.ledger-table :deep(.button-column) {
  width: calc(var(--p-button-icon-only-width) + 8px);
}

.ledger-table :deep(thead) {
  display: none;
}
</style>
