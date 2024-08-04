<script setup lang="ts">

const route = useRoute();
const ledger = useLedgerStore();

const recorderVisible = ref(false);

watch(ledger.entries, () => recorderVisible.value = false);
</script>

<template>
  <LedgerTable />
  <Drawer v-model:visible="recorderVisible" header="Record Progress" position="bottom" class="!h-[90vh]">
    <Recorder />
  </Drawer>
  <div class="fixed bottom-4 flex justify-center w-full">
    <Button icon="pi pi-plus" @click="recorderVisible = true" size="large" raised rounded class="!w-auto !h-auto"/>
  </div>
</template>
