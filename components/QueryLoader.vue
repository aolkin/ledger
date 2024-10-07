<script setup lang="ts" generic="E">
import type { Ref } from 'vue'

const { query } = defineProps<{
  query: {
    isPending: Ref<boolean>
    isSuccess: Ref<boolean>
    isError: Ref<boolean>
    error: Ref<E>
  }
}>()
</script>

<template>
  <LoadingBars v-if="query.isPending.value" />
  <div v-else-if="query.isError.value">
    <Message severity="error"><b>Error:</b> {{ query.error }}</Message>
  </div>
  <div v-else>
    <slot />
  </div>
</template>

<style scoped></style>
