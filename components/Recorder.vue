<script setup lang="ts">
import RecorderActivity from './RecorderActivity.vue'

const { ledgerId } = defineProps<{ ledgerId: string }>()

const templateQuery = useQueryTemplates(ledgerId)
</script>

<template>
  <DataView
    :value="templateQuery.data.value"
    layout="grid"
    sort-field="group"
    :sort-order="1"
  >
    <template #grid="slotProps">
      <div class="grid grid-cols-12 gap-4">
        <div
          v-for="(item, index) in slotProps.items"
          :key="index"
          class="col-span-6 sm:col-span-4 md:col-span-3 xl:col-span-2"
        >
          <RecorderActivity :item="item" />
        </div>
      </div>
    </template>
  </DataView>
</template>
