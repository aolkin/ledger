<script setup lang="ts">
const { count = 3 } = defineProps<{
  count?: number
}>()
</script>
<template>
  <div class="px-4">
    <Skeleton v-for="n in count" class="my-4" height="2rem" />
  </div>
</template>
<style scoped></style>
