<script setup lang="ts">
import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete'
import type { Ref } from 'vue'
import type { LedgerTemplate } from '../worker/router-types'

const { template } = defineProps<{ template: LedgerTemplate }>()
const emit = defineEmits(['update', 'update:dirty', 'save'])

const data = reactive({ ...template })
const dirty = ref(false)
watch(data, (value) => {
  emit('update', value)
  dirty.value = !(
    value.group === template.group &&
    value.title === template.title &&
    value.value === template.value &&
    value.unit === template.unit &&
    value.notes === template.notes
  )
  emit('update:dirty', dirty.value)
})

const templateQuery = useQueryTemplates(template.ledgerId)
const groups = computed(() =>
  getUnique(templateQuery.data.value, (template) => template.group),
)
const groupSuggestions: Ref<string[]> = ref([])

function updateSuggestions(event: AutoCompleteCompleteEvent) {
  groupSuggestions.value = groups.value.filter((g) => g.startsWith(event.query))
  if (groupSuggestions.value.length < 1) {
    groupSuggestions.value = [event.query]
  }
}
</script>

<template>
  <form
    class="flex gap-4 flex-col limit-width"
    @submit.prevent="emit('save', data)"
  >
    <div class="flex gap-4">
      <div class="flex flex-col gap-2 grow">
        <label for="group">Group</label>
        <AutoComplete
          id="group"
          v-model="data.group"
          dropdown
          :suggestions="groupSuggestions"
          :complete-on-focus="true"
          @complete="updateSuggestions"
        />
      </div>
    </div>
    <div class="flex gap-4">
      <div class="flex flex-col gap-2 grow">
        <label for="title">Activity Title</label>
        <InputText id="title" v-model="data.title" />
      </div>
    </div>
    <div class="flex gap-4">
      <div class="flex flex-col gap-2 grow limit-width-half">
        <label for="value">Points Value</label>
        <InputNumber
          id="value"
          v-model="data.value"
          show-buttons
          :max-fraction-digits="3"
          pt:pc-input:class="limit-width-half"
        />
      </div>
      <div class="flex flex-col gap-2 grow limit-width-half">
        <label for="unit">Per Unit</label>
        <InputText id="unit" v-model="data.unit" />
      </div>
    </div>
    <div class="flex gap-4">
      <div class="flex flex-col gap-2 grow">
        <label for="notes">Notes</label>
        <Textarea id="notes" v-model="data.notes" rows="4" auto-resize />
      </div>
    </div>
    <Button fluid @click="emit('save', data)" :disabled="!dirty" type="submit"
      >Save Changes
    </Button>
  </form>
</template>

<style scoped>
.limit-width {
  width: calc(100dvw - 2rem);
  overflow: scroll;
}

.limit-width-half,
.limit-width-half :deep(input) {
  max-width: calc(50vw - 1.5rem);
}
</style>
