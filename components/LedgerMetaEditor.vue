<script setup lang="ts">
import { addDay, dayStart } from '@formkit/tempo'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type {
  CreateLedgerInput,
  LedgerMeta,
  UpdateLedgerMetaInput,
} from '../worker/router-types'

const { ledger } = defineProps<{ ledger?: LedgerMeta }>()
const emit = defineEmits(['save'])

const trpc = useTrpc()
const queryClient = useQueryClient()

const ledgerQuery = useQuery({
  queryKey: ['metas'],
  queryFn: () => trpc.ledger.list.query(),
})

const now = new Date()

const getDataAndMutation = ledger
  ? () => {
      const ledgerData = reactive({ ...ledger })
      const mutation = useMutation({
        mutationFn: async (data: UpdateLedgerMetaInput) =>
          trpc.ledger.update.mutate(data),
        onSuccess: (data) => {
          console.log(data)
          queryClient.setQueryData(
            ['metas'],
            (ledgerQuery.data.value ?? []).map((item) =>
              item.id === data.id ? data : item,
            ),
          )
          emit('save', data)
        },
      })
      const mutate = () => mutation.mutate(ledgerData)
      return { ledgerData, mutate, mutation }
    }
  : () => {
      const ledgerData = reactive({
        name: 'New Ledger',
        startDate: dayStart(now),
        endDate: dayStart(addDay(now, 7)),
      })
      const mutation = useMutation({
        mutationFn: async (data: CreateLedgerInput) =>
          trpc.ledger.create.mutate(data),
        onSuccess: (data) => {
          console.log(data)
          queryClient.setQueryData(
            ['metas'],
            [...(ledgerQuery.data.value ?? []), data],
          )
          emit('save', data)
        },
      })
      const mutate = () => mutation.mutate(ledgerData)
      return { ledgerData, mutate, mutation }
    }

const { ledgerData, mutate, mutation } = getDataAndMutation()
</script>
<template>
  <div class="flex items-center gap-4 mt-4 w-full">
    <div class="flex-auto">
      <label for="name" class="block mb-2">Ledger Name</label>
      <InputText v-model="ledgerData.name" input-id="name" fluid />
    </div>
    <div class="flex-auto">
      <label for="start-date" class="block mb-2">Start Date</label>
      <DatePicker
        v-model="ledgerData.startDate"
        show-time
        hour-format="12"
        fluid
      />
    </div>
    <div class="flex-auto">
      <label for="end-date" class="block mb-2">End Date</label>
      <DatePicker
        v-model="ledgerData.endDate"
        show-time
        hour-format="12"
        fluid
      />
    </div>
    <div class="flex-initial pt-7">
      <Button
        icon="pi pi-check"
        iconPos="right"
        rounded
        @click="mutate"
        :loading="mutation.isPending.value"
      />
    </div>
  </div>
</template>
<style scoped></style>
