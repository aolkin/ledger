<script setup lang="ts">
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'

usePinia().use(piniaPluginPersistedState)

useHead({
  titleTemplate: (title) =>
    title ? `${title} - Activity Ledger` : 'Activity Ledger',
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <Toast style="max-width: calc(100% - 40px)" />
  <ConfirmDialog />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <VueQueryDevtools />
</template>

<style>
@import url('primeicons/primeicons.css');
</style>
