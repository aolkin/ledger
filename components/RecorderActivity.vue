<script setup lang="ts">
import { useToast } from "#imports"
import type { LedgerTemplate } from "../stores/ledger"

const { item } = defineProps<{
    item: LedgerTemplate,
}>();

const ledger = useLedgerStore();

const toast = useToast();

const adding = ref(false);

const multiplier = ref(1);
const total = computed(() => multiplier.value * item.value);

const addActivity = () => {
    ledger.addEntry(item.title, multiplier.value, item.value);
    toast.add({
        severity: 'success',
        summary: `Recorded ${item.title}`,
        detail: `${item.unit} x${multiplier.value} = ${total.value} pts`,
        life: 3000,
    });
    adding.value = false;
};
</script>

<template>
  <button class="w-full" @click="adding = true">
    <Card class="text-center border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900">
      <template #title>{{ item.title }}</template>
      <template #subtitle>per {{ item.unit }}</template>
      <template #footer>
        <Tag>+{{ item.value }} pts</Tag>
      </template>
    </Card>
  </button>
  <Dialog v-model:visible="adding" modal :header="`Record ${item.title}`" dismissable-mask class="m-2">
    <div class="text-slate-600 dark:text-slate-300">
      {{ item.notes }}
    </div>
    <div class="flex items-center gap-4 mt-4">
      <div class="flex-auto">
        <label for="multiplier" class="block mb-2">{{ _capitalize(item.unit) }}s</label>
        <InputNumber v-model="multiplier" prefix="x" :min="1" :allow-empty="false" input-id="multiplier"
                     highlight-on-focus show-buttons fluid />
      </div>
      <div class="flex-auto">
        <label for="total" class="block mb-2">Total</label>
        <InputNumber v-model="total" readonly suffix=" pts" input-id="total" fluid />
      </div>
      <div class="flex-auto pt-7">
        <Button icon="pi pi-check" iconPos="right" rounded @click="addActivity" />
      </div>
    </div>
  </Dialog>
</template>
