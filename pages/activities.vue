<script setup lang="ts">
import type { DataTableRowReorderEvent } from "primevue/datatable"
import type { LedgerTemplate } from "../stores/ledger"

definePageMeta({
    title: 'Ledger Configuration',
});

const route = useRoute();
const ledger = useLedgerStore();
const confirm = useConfirm();

// const previousUrl = useRouter().options.history.state.back;
// onBeforeRouteLeave((to, _) => {
//     if (recorderVisible.value) {
//         recorderVisible.value = false;
//         return to.fullPath === previousUrl;
//     } else {
//         return true;
//     }
// })

const expandedRows = ref<Record<string, boolean>>({});

const onReorder = (event: DataTableRowReorderEvent) => {
    const minSort = ledger.templates[event.dropIndex - 1].sort ?? 0;
    const maxSort = ledger.templates[event.dropIndex].sort ?? 1;
    const targetSort = minSort + (maxSort - minSort) / 2
    console.log(event.dragIndex, event.dropIndex, minSort, maxSort, targetSort);
    ledger.templates[event.dragIndex].sort = targetSort;
}

const addActivity = () => {
    const id = ledger.addTemplate({
        title: `New Activity ${ledger.templates.length}`,
        value: 1,
        unit: 'time',
    });
    expandedRows.value = { [id]: true };
}

const removeActivity = (item: LedgerTemplate) => {
    confirm.require({
        message: `Are you sure you want to delete ${item.title}?`,
        header: 'Delete Activity',
        icon: 'pi pi-trash',
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Delete',
            severity: 'danger',
        },
        accept: () => {
            ledger.removeTemplate(item.id);
        },
    });
}

</script>

<template>
  <DataTable :value="ledger.templates" @row-reorder="onReorder" v-model:expanded-rows="expandedRows"
             sort-field="sort" data-key="id" class="activity-table">
    <Column row-reorder class="button-column" />
    <Column expander class="button-column" />
    <Column field="title">
      <template #body="slotProps">
        <div class="cursor-pointer"
             @click="expandedRows = expandedRows[slotProps.data.id] ? {} : { [slotProps.data.id]: true }">
          {{ slotProps.data.title }}
        </div>
      </template>
    </Column>
    <Column class="button-column">
      <template #body="slotProps">
        <Button icon="pi pi-trash" severity="danger" size="small"
                @click="removeActivity(slotProps.data)" />
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
