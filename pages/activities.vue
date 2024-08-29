<script setup lang="ts">
import { onBeforeRouteLeave } from "vue-router"

definePageMeta({
    title: 'Ledger Configuration',
});

const route = useRoute();
const ledger = useLedgerStore();

// const previousUrl = useRouter().options.history.state.back;
// onBeforeRouteLeave((to, _) => {
//     if (recorderVisible.value) {
//         recorderVisible.value = false;
//         return to.fullPath === previousUrl;
//     } else {
//         return true;
//     }
// })

</script>

<template>
</template>
