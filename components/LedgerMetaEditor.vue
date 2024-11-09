<script setup lang="ts">
import { addDay, dayStart } from '@formkit/tempo'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useQueryLedgers, useQuerySession } from '../composables/queries'
import {
  AccessLevel,
  AccessLevelLabels,
  type CreateLedgerInput,
  type LedgerMeta,
  type UpdateLedgerMetaInput,
} from '../worker/router-types'
import LedgerShareManager from './LedgerShareManager.vue'

const { ledger } = defineProps<{ ledger?: LedgerMeta }>()
const emit = defineEmits(['save'])

const confirm = useConfirm()
const trpc = useTrpc()
const queryClient = useQueryClient()
const session = useQuerySession()
const ledgerQuery = useQueryLedgers()

const now = new Date()

const getDataAndMutation = ledger
  ? () => {
      const ledgerData = reactive({ ...ledger, ledgerId: ledger.id })
      const mutation = useMutation({
        mutationFn: async (data: UpdateLedgerMetaInput) =>
          trpc.ledger.update.mutate(data),
        onSuccess: (data) => {
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
      const myAccess = ledger.access.find(
        (item) => item.user.email === session.data.value.user.email,
      )
      return { ledgerData, myAccess, mutate, mutation }
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
          queryClient.setQueryData(
            ['metas'],
            [...(ledgerQuery.data.value ?? []), data],
          )
          emit('save', data)
        },
      })
      const mutate = () => mutation.mutate(ledgerData)
      return { ledgerData, myAccess: undefined, mutate, mutation }
    }

const { ledgerData, myAccess, mutate, mutation } = getDataAndMutation()
const canEdit = myAccess?.level === AccessLevel.ADMIN ?? true

const removeMutation = useMutation({
  mutationFn: async (ledgerId: string) => {
    await trpc.ledger.delete.mutate({ ledgerId })
    return ledgerId
  },
  onSuccess: (ledgerId) => {
    queryClient.setQueryData(
      ['metas'],
      ledgerQuery.data.value?.filter((item) => item.id !== ledgerId),
    )
  },
})

const removeLedger = (item: LedgerMeta) => {
  confirm.require({
    message: `Are you sure you want to delete ${item.name}?`,
    header: 'Permanently Delete Ledger',
    icon: 'pi pi-trash',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Delete',
      severity: 'danger',
    },
    accept: () => {
      removeMutation.mutate(item.id)
    },
  })
}
</script>
<template>
  <div class="flex flex-wrap items-center gap-4 mt-4 w-full">
    <div class="flex items-center gap-4 md:flex-nowrap flex-wrap grow">
      <div class="md:w-auto w-full flex-auto">
        <label for="name" class="block mb-2">Ledger Name</label>
        <InputText
          v-model="ledgerData.name"
          input-id="name"
          fluid
          :disabled="!canEdit"
        />
      </div>
      <div class="md:w-auto w-full flex-auto">
        <label for="start-date" class="block mb-2">Start Date</label>
        <DatePicker
          v-model="ledgerData.startDate"
          show-time
          hour-format="12"
          fluid
          :disabled="!canEdit"
        />
      </div>
      <div class="md:w-auto w-full flex-auto">
        <label for="end-date" class="block mb-2">End Date</label>
        <DatePicker
          v-model="ledgerData.endDate"
          show-time
          hour-format="12"
          fluid
          :disabled="!canEdit"
        />
      </div>
    </div>
    <div
      class="flex justify-center gap-12 md:gap-4 md:w-auto w-full md:pt-7 flex-row-reverse md:flex-row"
      v-if="canEdit"
    >
      <div class="flex-initial">
        <Button
          icon="pi pi-check"
          iconPos="right"
          rounded
          @click="mutate"
          :loading="mutation.isPending.value"
        />
      </div>
      <div class="flex-initial" v-if="ledger">
        <Button
          icon="pi pi-trash"
          severity="danger"
          iconPos="right"
          rounded
          @click="removeLedger(ledger)"
        />
      </div>
    </div>
  </div>
  <div
    class="flex flex-wrap items-center gap-4 mt-4 w-full"
    v-if="ledger && myAccess?.level === AccessLevel.ADMIN"
  >
    <LedgerShareManager :ledger="ledger.id" :access="ledger.access" />
  </div>
  <div v-else-if="myAccess" class="mb-2 mt-4 w-full">
    You have "{{ AccessLevelLabels[myAccess.level as AccessLevel] }}" permission
    on this ledger.
  </div>
</template>
<style scoped></style>
