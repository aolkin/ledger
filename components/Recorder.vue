<script setup lang="ts">
import RecorderActivity from "./RecorderActivity.vue"

const ledger = useLedgerStore();
</script>

<template>
  <DataView :value="ledger.templates" layout="grid">
    <template #grid="slotProps">
      <div class="grid grid-cols-12 gap-4">
        <div v-for="(item, index) in slotProps.items" :key="index" class="col-span-6 sm:col-span-4 md:col-span-3 xl:col-span-2">
          <RecorderActivity :item="item" />
        </div>
      </div>
    </template>
  </DataView>
  <Button @click="ledger.addTemplate('Test Activity', 1.5, 'chapter', 'notes...')">Sample</Button>
</template>
