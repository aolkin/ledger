<script setup lang="ts">
import { onBeforeRouteLeave } from "vue-router"

definePageMeta({
    // title: 'Home'
});

const router = useRouter();
const ledger = useLedgerStore();

const recorderVisible = ref(false);

function showRecorder() {
    recorderVisible.value = true;
    router.push({ name: 'index' })
}

watch(ledger.entries, () => recorderVisible.value = false);

const previousUrl = useRouter().options.history.state.back;
onBeforeRouteLeave((to, _) => {
    if (recorderVisible.value) {
        recorderVisible.value = false;
        return false;
    } else {
        return true;
    }
});

</script>

<template>
  <div>
    <div class="w-full flex flex-col my-5 text-center gap-2">
      <div class="text-4xl">Total: {{ ledger.total }} pts</div>
      <div class="text-3xl">Today: {{ ledger.today }} pts</div>
    </div>
    <LedgerTable class="mb-20" />
    <Drawer v-model:visible="recorderVisible" header="Record Progress" position="bottom" class="!h-[90vh]">
      <Recorder />
    </Drawer>
    <div class="fixed bottom-4 flex justify-center w-full">
      <Button icon="pi pi-plus" @click="showRecorder" size="large" raised rounded class="!w-auto !h-auto" />
    </div>
  </div>
</template>
