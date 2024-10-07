<script setup lang="ts">
const { count, maxCount = 5 } = defineProps<{
  count?: number
  maxCount?: number
}>()

const counter = ref(maxCount !== 0 ? (count ?? 1) : (count ?? 3))

useIntervalFn(() => {
  if (counter.value >= maxCount) {
    counter.value = 0
  } else {
    counter.value += 1
  }
}, 500)
</script>
<template>
  <div class="px-4" v-auto-animate>
    <Skeleton v-for="n in counter" class="my-4" height="2rem" />
  </div>
</template>
<style scoped></style>
