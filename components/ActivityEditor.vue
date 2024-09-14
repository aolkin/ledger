<script setup lang="ts">
import type { LedgerTemplate } from "../stores/ledger"

const { template } = defineProps({
    template: {
        type: Object as () => LedgerTemplate,
        required: true,
    },
})


</script>

<template>
  <div class="flex gap-4 flex-col limit-width">
    <div class="flex gap-4">
      <div class="flex flex-col gap-2 grow">
        <label for="title">Activity Title</label>
        <InputText id="title" v-model="template.title" />
      </div>
    </div>
    <div class="flex gap-4">
      <div class="flex flex-col gap-2 grow limit-width-half">
        <label for="value">Points Value</label>
        <InputNumber id="value" v-model="template.value" show-buttons :max-fraction-digits="3"
                     pt:pc-input:class="limit-width-half" />
      </div>
      <div class="flex flex-col gap-2 grow limit-width-half">
        <label for="unit">Per Unit</label>
        <InputText id="unit" v-model="template.unit" />
      </div>
    </div>
    <div class="flex gap-4">
      <div class="flex flex-col gap-2 grow">
        <label for="notes">Notes</label>
        <Textarea id="notes" v-model="template.notes" rows="4" auto-resize />
      </div>
    </div>
  </div>
</template>

<style scoped>
.limit-width {
    width: calc(100dvw - 2rem);
    overflow: scroll;
}

.limit-width-half, .limit-width-half :deep(input) {
    max-width: calc(50vw - 1.5rem);
}
</style>
