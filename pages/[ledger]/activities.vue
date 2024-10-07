<script setup lang="ts">
import type { LedgerEntry } from '~/worker/router-types'

const { ledger } = defineProps<{ ledger: string }>()
const router = useRouter()
const route = useRoute()

const drawerVisible = ref(false)
watch(
  () => route.matched.length,
  (newRoutes, oldRoutes) => {
    if (newRoutes !== oldRoutes) {
      drawerVisible.value = newRoutes > 1
    }
  },
  { immediate: true },
)

const ledgerQuery = useQueryEntries(ledger)

const sumEntries = (entries: LedgerEntry[] | undefined): number =>
  (entries ?? []).reduce((acc, entry) => acc + entry.value, 0)

const now = useNow({ interval: 30 * 1000 })
const isToday = (date: Date): boolean =>
  date.getDate() === now.value.getDate() &&
  date.getMonth() === now.value.getMonth() &&
  date.getFullYear() === now.value.getFullYear()

const total = computed(() => sumEntries(ledgerQuery.data.value))
const today = computed(() =>
  sumEntries(
    ledgerQuery.data.value?.filter(({ timestamp }) => isToday(timestamp)),
  ),
)

watch(drawerVisible, (value) => {
  if (!value && route.matched.length > 1) {
    router.back()
  }
})
</script>

<template>
  <QueryLoader :query="ledgerQuery">
    <div class="w-full flex flex-col my-5 text-center gap-2">
      <div class="text-4xl">Total: {{ total }} pts</div>
      <div class="text-3xl">Today: {{ today }} pts</div>
    </div>
    <LedgerTable class="mb-20" :ledger="ledger" />
    <Drawer
      v-model:visible="drawerVisible"
      :header="route.meta.title"
      position="bottom"
      class="!h-[90vh]"
    >
      <NuxtPage />
    </Drawer>
    <FloatingPlusButton
      as="router-link"
      :to="{ name: 'ledger-activities-record' }"
    />
  </QueryLoader>
</template>
