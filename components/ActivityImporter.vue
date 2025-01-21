<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { ImportInput, LedgerMeta } from '../worker/router-types'
import { format } from '@formkit/tempo'

const { ledger: ledgerId } = defineProps<{ ledger: string }>()

const trpc = useTrpc()
const queryClient = useQueryClient()

const ledgersQuery = useQueryLedgers()
const { isFetching, isSuccess, isPending, data: ledgers } = ledgersQuery

const ledgerOptions = computed(() =>
  ledgers.value
    ?.filter((l) => l.id !== ledgerId)
    .sort((a, b) => b.endDate.getTime() - a.endDate.getTime()),
)

const selectedLedger = ref<string | undefined>(undefined)

const importMutation = useMutation({
  mutationFn: (data: Omit<ImportInput, 'ledgerId'>) =>
    trpc.template.copy.mutate({ ...data, ledgerId }),
  onSuccess: (data) =>
    queryClient.invalidateQueries({ queryKey: templatesQueryKey(ledgerId) }),
})
const executeImport = () => {
  if (!selectedLedger.value) {
    return
  }
  importMutation.mutate({
    source: selectedLedger.value,
    // TODO: Show a list of activities to copy and allow selecting a subset
  })
}
</script>

<template>
  <div class="text-slate-600 dark:text-slate-300">
    Copy activities from another existing ledger:
  </div>
  <div class="flex items-center gap-4 mt-4">
    <div class="flex-auto w-full">
      <label for="ledger" class="block mb-2">
        Select a ledger to import from:
      </label>
      <Select
        v-model="selectedLedger"
        :loading="isPending"
        :options="ledgerOptions"
        option-label="name"
        option-value="id"
        placeholder="Select a ledger"
        fluid
      >
        <template #option="slotProps">
          <div class="flex space-between gap-1">
            <div>{{ slotProps.option.name }}</div>
            <div class="text-slate-500 dark:text-slate-400">
              ({{ format(slotProps.option.startDate, 'short') }}-{{
                format(slotProps.option.endDate, 'short')
              }})
            </div>
          </div>
        </template>
      </Select>
    </div>
    <div class="flex-auto pt-7">
      <Button
        icon="pi pi-check"
        iconPos="right"
        rounded
        @click="executeImport"
        :disabled="!selectedLedger"
      />
    </div>
  </div>
</template>

<style scoped></style>
