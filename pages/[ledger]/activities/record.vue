<script setup lang="ts">
import RecorderActivity from '~/components/RecorderActivity.vue'

const { ledger } = defineProps<{ ledger: string }>()

useHead({
  title: 'Record Activity',
})

definePageMeta({
  title: 'Record Activity',
})

const templateQuery = useQueryTemplates(ledger)
</script>

<template>
  <div>
    <DataView
      :value="templateQuery.data.value"
      layout="grid"
      sort-field="group"
      :sort-order="1"
    >
      <template #empty>
        <div class="p-4 text-center">
          No activities available!
          <Button as="router-link" link :to="{ name: 'ledger-manage' }">
            Create some.
          </Button>
        </div>
      </template>
      <template #grid="slotProps">
        <div class="grid grid-cols-12 gap-4">
          <div
            v-for="(item, index) in slotProps.items"
            :key="index"
            class="col-span-6 sm:col-span-4 md:col-span-3 xl:col-span-2"
          >
            <RecorderActivity :item="item" />
          </div>
        </div>
      </template>
    </DataView>
  </div>
</template>

<style scoped></style>
