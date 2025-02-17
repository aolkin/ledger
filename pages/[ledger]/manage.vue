<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { DataTableRowExpandEvent } from 'primevue/datatable'
import QueryLoader from '../../components/QueryLoader.vue'
import type {
  CreateTemplateInput,
  LedgerTemplate,
  UpdateTemplateInput,
} from '../../worker/router-types'

const { ledger: ledgerId } = defineProps<{ ledger: string }>()

useHead({
  title: 'Configuration',
})

const trpc = useTrpc()

const confirm = useConfirm()
const queryClient = useQueryClient()

const templateQuery = useQueryTemplates(ledgerId)
const { isFetching, isSuccess, data: templates } = templateQuery

const importing = ref(false)

const expandedRows = ref<Record<string, boolean>>({})
const expandedRowGroups = ref()
const rowMeta = ref<Record<string, { dirty: boolean; data?: LedgerTemplate }>>(
  {},
)

const groups = computed(() =>
  getUnique(templates.value, (template) => template.group),
)

watchEffect(() => {
  console.log(expandedRowGroups.value, groups.value)
  if (!expandedRowGroups.value && groups.value.length === 1) {
    expandedRowGroups.value = groups.value
  }
})

const onRowExpand = (event: DataTableRowExpandEvent) => {
  rowMeta.value[event.data.id] = { dirty: false }
}

const addMutation = useMutation({
  mutationFn: (data: Omit<CreateTemplateInput, 'ledgerId'>) =>
    trpc.template.create.mutate({ ...data, ledgerId }),
  onSuccess: (data) => {
    queryClient.setQueryData(templatesQueryKey(ledgerId), [
      ...(templates.value ?? []),
      data,
    ])
    expandedRows.value = { [data.id]: true }
    expandedRowGroups.value = ['']
    rowMeta.value[data.id] = { dirty: false }
  },
})
const addActivity = () => {
  addMutation.mutate({
    title: `New Activity ${templates.value?.length + 1}`,
    value: 1,
    unit: 'time',
    group: '',
  })
}

const removeMutation = useMutation({
  mutationFn: async (templateId: string) => {
    await trpc.template.delete.mutate({ id: templateId, ledgerId })
    return templateId
  },
  onSuccess: (templateId) => {
    queryClient.setQueryData(
      templatesQueryKey(ledgerId),
      templates.value?.filter((item) => item.id !== templateId),
    )
  },
})

const removeTemplate = (item: LedgerTemplate) => {
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
      removeMutation.mutate(item.id)
    },
  })
}

const updateMutation = useMutation({
  mutationFn: async (data: UpdateTemplateInput) => {
    await trpc.template.update.mutate(data)
    return data
  },
  onSuccess: (data) => {
    queryClient.setQueryData(
      templatesQueryKey(ledgerId),
      templates.value?.map((item) => (item.id === data.id ? data : item)),
    )
  },
})
const updateTemplate = (template: LedgerTemplate) => {
  updateMutation.mutate(template)
  delete expandedRows.value[template.id]
}
</script>

<template>
  <QueryLoader :query="templateQuery">
    <div class="mb-20">
      <DataTable
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
        class="template-table"
      >
        <template #empty>
          <div class="p-4 text-center">
            No activities created.
            <Button link @click="addActivity">Add one.</Button>
          </div>
        </template>
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
              @click="removeTemplate(slotProps.data)"
            />
          </template>
        </Column>
        <template #expansion="slotProps">
          <ActivityEditor
            :template="slotProps.data"
            @update:dirty="rowMeta[slotProps.data.id].dirty = $event.data"
            @update="rowMeta[slotProps.data.id].data = $event.data"
            @save="updateTemplate"
          />
        </template>
      </DataTable>
      <div class="p-4 text-center">
        <Button @click="importing = true">Import from another ledger</Button>
      </div>
      <Dialog
        v-model:visible="importing"
        modal
        header="Import Activities"
        dismissable-mask
        class="m-2"
      >
        <ActivityImporter :ledger="ledgerId" />
      </Dialog>
    </div>
    <FloatingPlusButton
      @click="addActivity"
      v-if="isSuccess"
      :loading="isFetching || addMutation.isPending.value"
    />
  </QueryLoader>
</template>

<style scoped>
.template-table :deep(.button-column) {
  width: calc(var(--p-button-icon-only-width) + 8px);
}

.template-table :deep(thead) {
  display: none;
}
</style>
