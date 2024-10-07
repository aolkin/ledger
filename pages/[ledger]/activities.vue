<script setup lang="ts">
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

const total = computed(() => 25)
const today = computed(() => 2.5)

// watch(ledger.entries, () => {
//   if (drawerVisible.value) {
//     router.push(route.matched[0])
//   }
// })
watch(drawerVisible, (value) => {
  if (!value && route.matched.length > 1) {
    router.back()
  }
})
</script>

<template>
  <div>
    <div class="w-full flex flex-col my-5 text-center gap-2">
      <div class="text-4xl">Total: {{ total }} pts</div>
      <div class="text-3xl">Today: {{ today }} pts</div>
    </div>
    <LedgerTable class="mb-20" />
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
      :to="{ name: 'ledger-activities-record', params: { id: ledger } }"
    />
  </div>
</template>
