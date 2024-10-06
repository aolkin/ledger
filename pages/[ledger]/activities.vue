<script setup lang="ts">
import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/vue-query'
import type { DataTableRowExpandEvent } from 'primevue/datatable'
import { queryMeta } from '../../clients/queries'
import LoadingBars from '../../components/LoadingBars.vue'
import type { CreateTemplateInput } from '../../worker/router-types'

const { ledger: slug } = defineProps<{ ledger: string }>()

useHead({
  title: 'Configuration',
})

const trpc = useTrpc()

const route = useRoute()
const ledger = useLedgerStore()
const confirm = useConfirm()
const queryClient = useQueryClient()

const metaQuery = useQuery(queryMeta(slug))
const ledgerUuid = computed(() => metaQuery.data?.value?.id)

const queryFn = computed(() => {
  const ledgerId = ledgerUuid.value
  return typeof ledgerId === 'string'
    ? () => trpc.template.getForLedger.query({ ledgerId })
    : skipToken
})
const {
  isPending,
  isSuccess,
  isError,
  data: templates,
} = useQuery({
  queryKey: ['templates', ledgerUuid.value],
  queryFn,
})

const expandedRows = ref<Record<string, boolean>>({})
const expandedRowGroups = ref()
const rowMeta = ref<
  Record<ObjectId, { dirty: boolean; data?: LedgerTemplate }>
>({})

const onRowExpand = (event: DataTableRowExpandEvent) => {
  console.log(event.data)
  rowMeta.value[event.data.id] = { dirty: false }
}

const addMutation = useMutation({
  mutationFn: async (data: Omit<CreateTemplateInput, 'ledgerId'>) => {
    const ledgerId = ledgerUuid.value
    if (!ledgerId) {
      throw new Error()
    }
    return await trpc.template.create.mutate({ ...data, ledgerId })
  },
  onSuccess: (data) => {
    console.log(data)
    queryClient.setQueryData(
      ['templates', ledgerUuid.value],
      [...(templates.value ?? []), data],
    )
    expandedRows.value = { [data.id]: true }
    expandedRowGroups.value = ['']
    rowMeta.value[data.id] = { dirty: false }
  },
})
const addActivity = () => {
  addMutation.mutate({
    title: `New Activity ${templates.value?.length}`,
    value: 1,
    unit: 'time',
    group: '',
  })
}

const removeMutation = useMutation({
  mutationFn: async (data: { id: string }) => {
    trpc.template.delete.mutate({ ...data, ledgerId: ledgerUuid.value })
  },
})

const removeActivity = (item: LedgerTemplate) => {
  confirm.require({
    message: `Are you sure you want to delete ${item.title}?`,
    header: 'Delete Activity',
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
      trpc.template.delete.mutate({ id: item.id, ledgerId: ledgerUuid.value })
    },
  })
}

const updateActivity = (activity: LedgerTemplate) => {
  ledger.updateTemplate(activity.id, activity)
  delete expandedRows.value[activity.id]
}
</script>

<template>
  <div>
    <LoadingBars v-if="isPending" />
    <div v-else-if="isError">Error!</div>
    <DataTable
      v-else
      :value="templates"
      v-model:expanded-rows="expandedRows"
      v-model:expanded-row-groups="expandedRowGroups"
      @row-expand="onRowExpand"
      expandable-row-groups
      row-group-mode="subheader"
      group-rows-by="group"
      sort-field="group"
      :sort-order="1"
      data-key="id"
      class="activity-table mb-20"
    >
      <template #groupheader="slotProps">
        <b class="align-top ml-2">{{
          slotProps.data.group || 'Default Group'
        }}</b>
      </template>
      <Column expander class="button-column" />
      <Column field="title">
        <template #body="slotProps">
          <div
            class="cursor-pointer"
            @click="
              expandedRows = expandedRows[slotProps.data.id]
                ? {}
                : { [slotProps.data.id]: false }
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
        <ActivityEditor
          :template="slotProps.data"
          @update:dirty="rowMeta[slotProps.data.id].dirty = $event.data"
          @update="rowMeta[slotProps.data.id].data = $event.data"
          @save="updateActivity"
        />
      </template>
    </DataTable>
    <FloatingPlusButton @click="addActivity" v-if="isSuccess" />
  </div>
</template>

<style scoped>
.activity-table :deep(.button-column) {
  width: calc(var(--p-button-icon-only-width) + 8px);
}

.activity-table :deep(thead) {
  display: none;
}
</style>
