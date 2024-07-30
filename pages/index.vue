<script setup lang="ts">
//import { useLedgerStore } from "../stores/ledger"

const route = useRoute();
const ledger = useLedgerStore();
window.ledger = ledger;
</script>

<template>
  <div>
    <h1>Nuxt Routing set up successfully!</h1>
    <p>Current route: {{ route.path }}</p>
    <a href="https://nuxt.com/docs/getting-started/routing" target="_blank">Learn more about Nuxt Routing</a>
  </div>
</template>
