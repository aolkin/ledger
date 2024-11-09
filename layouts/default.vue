<script setup lang="ts">
import { skipToken, useQuery } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'
import LoadingBars from '../components/LoadingBars.vue'
import { useAuth } from '../composables/auth'

const sessionQuery = useQuerySession()
const { login } = useAuth()

const route = useRoute()
const trpc = useTrpc()
const pathLedgerId = computed(() => {
  return route.params.ledger
})
const queryFn = computed(() => {
  const ledgerId = pathLedgerId.value
  return sessionQuery.data.value && typeof ledgerId === 'string'
    ? () => trpc.ledger.get.query({ ledgerId })
    : skipToken
})
const { isPending, isError, isSuccess, data, error } = useQuery({
  queryKey: ['meta', { id: pathLedgerId.value }],
  queryFn,
})

// watch([sessionQuery.isSuccess, sessionQuery.data], () => {
//   if (sessionQuery.isSuccess.value && !sessionQuery.data.value) {
//     login()
//   }
// })
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
      <template #center>
        <div v-if="pathLedgerId">
          <Button
            as="router-link"
            :to="{
              name: 'ledger-activities',
              params: { ledger: pathLedgerId },
            }"
            text
          >
            <i class="pi pi-list" />
            <span>{{ data ? data.name : 'Loading...' }}</span>
          </Button>
        </div>
        <div v-else>
          <b>{{ route.meta.title }}</b>
        </div>
      </template>
      <template #end>
        <Button
          v-if="pathLedgerId"
          as="router-link"
          :to="{
            name: 'ledger-manage',
            params: { ledger: pathLedgerId },
          }"
          icon="pi pi-cog"
          text
        />
        <!--<Button
          v-else
          as="router-link"
          :to="{
            name: 'user',
          }"
          icon="pi pi-user"
          text
        />-->
        <UserMenu />
      </template>
    </Toolbar>
    <LoadingBars v-if="sessionQuery.isPending.value" />
    <div v-else-if="!sessionQuery.data.value">
      <Message severity="info">Please log in.</Message>
    </div>
    <LoadingBars v-else-if="pathLedgerId && isPending" />
    <div v-else-if="pathLedgerId && isError">
      <Message severity="error">Error! {{ error }}</Message>
    </div>
    <slot v-else />
  </div>
</template>

<style scoped></style>
