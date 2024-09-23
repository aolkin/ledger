<script setup lang="ts">
import type { DataTableRowExpandEvent } from 'primevue/datatable'
import type { ObjectId, LedgerTemplate } from '../stores/ledger'

useHead({
  title: 'Configuration',
})

const route = useRoute()
const ledger = useLedgerStore()
const confirm = useConfirm()

const expandedRows = ref<Record<string, boolean>>({})
const expandedRowGroups = ref()
const rowMeta = ref<
  Record<ObjectId, { dirty: boolean; data?: LedgerTemplate }>
>({})

const onRowExpand = (event: DataTableRowExpandEvent) => {
  console.log(event.data)
  rowMeta.value[event.data.id] = { dirty: false }
}

const addActivity = () => {
  const id = ledger.addTemplate({
    title: `New Activity ${ledger.templates.length}`,
    value: 1,
    unit: 'time',
    group: '',
  })
  expandedRows.value = { [id]: true }
  expandedRowGroups.value = ['']
  rowMeta.value[id] = { dirty: false }
}

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
      ledger.removeTemplate(item.id)
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
    <DataTable
      :value="ledger.templates"
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
    <FloatingPlusButton @click="addActivity" />
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
