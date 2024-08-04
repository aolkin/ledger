<script setup lang="ts">
import piniaPluginPersistedState from "pinia-plugin-persistedstate";

usePinia().use(piniaPluginPersistedState);
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
  </div>
  <Toast style="max-width: calc(100% - 40px)" />
  <NuxtPage />
</template>

<style>
@import url('primeicons/primeicons.css');
</style>
