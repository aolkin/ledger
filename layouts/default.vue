<script setup lang="ts">
import { skipToken, useQuery } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'
import LoadingBars from '../components/LoadingBars.vue'

const route = useRoute()
const trpc = useTrpc()
const pathSlug = computed(() => {
  console.log(route.params, route.path)
  return route.params.ledger
})
const queryFn = computed(() => {
  const slug = pathSlug.value
  return typeof slug === 'string'
    ? () => trpc.ledger.get.query({ slug })
    : skipToken
})
const { isPending, isError, isSuccess, data, error } = useQuery({
  queryKey: ['meta', { id: pathSlug.value }],
  queryFn,
})
</script>

<template>
  <div class="h-dvh flex flex-col">
    <Toolbar class="!rounded-none !p-0 !border-x-0 sticky top-0 z-50">
      <template #start>
        <Button
          as="router-link"
          :to="{ name: 'index' }"
          icon="pi pi-book"
          text
        />
      </template>
      <template #center v-if="pathSlug">
        <Button
          as="router-link"
          :to="{
            name: 'ledger',
            params: { ledger: pathSlug },
          }"
          text
        >
          <i class="pi pi-list" />
          <span>{{ data ? data.name : 'Loading...' }}</span>
        </Button>
      </template>
      <template #end v-if="pathSlug">
        <Button
          as="router-link"
          :to="{
            name: 'ledger-activities',
            params: { ledger: pathSlug },
          }"
          icon="pi pi-cog"
          text
        />
      </template>
    </Toolbar>
    <LoadingBars v-if="pathSlug && isPending" />
    <div v-else-if="pathSlug && isError">
      <Message severity="error">Error! {{ error }}</Message>
    </div>
    <slot v-else />
  </div>
</template>

<style scoped></style>
