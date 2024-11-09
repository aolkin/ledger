<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete'
import {
  AccessLevel,
  AccessLevelLabels,
  type LedgerShare,
  type ShareLedgerInput,
} from '../worker/router-types'

const {
  ledger: ledgerId,
  shares,
  access,
} = defineProps<{
  ledger: string
  shares: LedgerShare[]
  access?: LedgerShare
}>()
const emit = defineEmits(['create', 'update', 'delete'])

const trpc = useTrpc()
const queryClient = useQueryClient()
const ledgersQuery = useQueryLedgers()

const shareName = ref(access?.user.name ?? '')
const shareEmail = ref(access?.user.email ?? '')
const shareLevel = ref<AccessLevel>(
  (access?.level as AccessLevel) ?? AccessLevel.RECORD,
)
const existing = ref(!!access)
const deleted = ref(false)
const emailValid = computed(() => shareEmail.value.length > 3)

const patchAccess = (existing: LedgerShare[], update: LedgerShare) => {
  const exists =
    existing.find((share) => share.user.email === update.user.email) !==
    undefined
  if (exists) {
    return existing.map((item) =>
      item.user.email === update.user.email ? update : item,
    )
  } else {
    return [...existing, update]
  }
}

function patchLedgerMetas(
  patchAccess: (existing: LedgerShare[]) => LedgerShare[],
) {
  queryClient.setQueryData(
    ['metas'],
    (ledgersQuery.data.value ?? []).map((item) =>
      item.id === ledgerId
        ? {
            ...item,
            access: patchAccess(item.access),
          }
        : item,
    ),
  )
}

const emailSuggestions = ref<string[]>([])

function updateSuggestions(event: AutoCompleteCompleteEvent) {
  const emails = new Set(
    ledgersQuery.data?.value
      ?.flatMap((ledger) => ledger.access)
      .map((access) => access.user.email) ?? [],
  )
  shares.forEach((share) => emails.delete(share.user.email))
  emailSuggestions.value = [...emails].filter(
    (e): e is string => e?.startsWith(event.query) ?? false,
  )
  if (emailSuggestions.value.length < 1) {
    emailSuggestions.value = [event.query]
  }
}

const mutation = useMutation({
  mutationFn: async (data: Required<ShareLedgerInput>) =>
    trpc.ledger.share.mutate(data),
  onSuccess: (user, { ledgerId, level }) => {
    patchLedgerMetas((existing) => patchAccess(existing, { level, user }))
    deleted.value = false
    emit(existing.value ? 'update' : 'create', user)
    existing.value = true
    shareName.value = user.name || ''
  },
})

const share = () => {
  if (!emailValid) {
    return false
  }
  mutation.mutate({
    ledgerId,
    email: shareEmail.value,
    level: shareLevel.value,
  })
}

const removeMutation = useMutation({
  mutationFn: async (data: Omit<ShareLedgerInput, 'level'>) => {
    await trpc.ledger.share.mutate(data)
    return data.email
  },
  onSuccess: (email) => {
    patchLedgerMetas((existing) =>
      existing.filter((share) => share.user.email !== email),
    )
    deleted.value = true
    emit('delete', email)
  },
})

const unshare = () => {
  removeMutation.mutate({
    ledgerId,
    email: shareEmail.value,
  })
}

const accessLevels = ref(
  Object.entries(AccessLevelLabels).map(([level, label]) => ({ level, label })),
)
</script>

<template>
  <div class="flex items-center gap-4 md:flex-nowrap flex-wrap grow">
    <div class="md:w-auto w-full flex-auto" v-if="existing">
      <label for="share-name" class="block mb-2">Collaborator</label>
      <span
        class="text-lg"
        :class="{ 'line-through': deleted }"
        v-text="shareName"
      />
      <span
        class="text-sm text-slate-500 dark:text-slate-400 pl-1"
        v-text="shareEmail"
      />
    </div>
    <div class="md:w-auto w-full flex-auto" v-else>
      <label for="share-email" class="block mb-2">Collaborator Email</label>
      <AutoComplete
        v-model="shareEmail"
        type="email"
        input-id="share-email"
        :suggestions="emailSuggestions"
        @complete="updateSuggestions"
        fluid
      />
    </div>
    <div class="md:w-auto w-full">
      <label for="share-level" class="block mb-2">Access Level</label>
      <Select
        v-model="shareLevel"
        input-id="share-level"
        fluid
        :options="accessLevels"
        optionLabel="label"
        optionValue="level"
        :disabled="deleted"
      />
    </div>
  </div>
  <div
    class="flex justify-center gap-12 md:gap-4 md:w-auto w-full md:pt-7 flex-row-reverse md:flex-row"
  >
    <div class="flex-initial" v-if="!deleted">
      <Button
        :icon="existing ? 'pi pi-check' : 'pi pi-user-plus'"
        iconPos="right"
        rounded
        @click="share"
        :loading="mutation.isPending.value"
        :disabled="!emailValid"
      />
    </div>
    <div class="flex-initial" v-if="!deleted">
      <Button
        icon="pi pi-user-minus"
        severity="danger"
        iconPos="right"
        rounded
        @click="unshare"
        :loading="removeMutation.isPending.value"
        :disabled="!existing"
      />
    </div>
    <div class="flex-initial" v-if="deleted">
      <Button
        severity="danger"
        iconPos="right"
        rounded
        @click="share"
        :loading="mutation.isPending.value"
      >
        Undo <i class="pi pi-undo" />
      </Button>
    </div>
  </div>
</template>

<style scoped></style>
