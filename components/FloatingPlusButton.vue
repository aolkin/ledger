<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})
</script>

<template>
  <div class="fixed bottom-4 flex justify-center w-full pointer-events-none">
    <Button
      icon="pi pi-plus"
      size="large"
      raised
      rounded
      class="!w-auto !h-auto pointer-events-auto"
      v-bind="$attrs"
    />
  </div>
</template>
