<script setup lang="ts">
import { useQuerySession } from '../composables/queries'
import type { LedgerShare } from '../worker/router-types'
import LedgerShareEditor from './LedgerShareEditor.vue'

const { ledger, access } = defineProps<{
  ledger: string
  access: LedgerShare[]
}>()

const session = useQuerySession()

const otherAccess = computed(() => [
  ...access.filter((item) => item.user.email !== session.data.value.user.email),
  undefined,
])
</script>

<template>
  <div class="text-xl">Share With Others</div>
  <div
    class="flex flex-wrap items-center gap-4 mb-1 w-full"
    v-for="share in otherAccess"
  >
    <LedgerShareEditor
      :ledger="ledger"
      :shares="access"
      :access="share"
      :key="share?.user.email ?? 'new'"
    />
  </div>
</template>

<style scoped></style>
