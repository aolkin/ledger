<script setup lang="ts">
const { ledger } = defineProps<{ ledger: string }>()

useHead({
  title: 'Record Activity',
})

definePageMeta({
  title: 'Record Activity',
})
</script>

<template>
  <div>
    <Recorder :ledger-id="ledger" />
  </div>
</template>

<style scoped></style>
