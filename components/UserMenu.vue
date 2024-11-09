<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'

const toast = useToast()
const queryClient = useQueryClient()

const { login, logout } = useAuth()

const { isPending, isError, isSuccess, data, error } = useQuerySession()

const menu = ref()

const items = computed(() =>
  !isSuccess
    ? []
    : data.value
      ? [
          { separator: true },
          {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: async () => {
              await logout()
              await queryClient.resetQueries()
            },
          },
        ]
      : [
          {
            label: 'Login',
            icon: 'pi pi-sign-in',
            command: async () => {
              try {
                await login()
              } catch (e) {
                toast.add({
                  severity: 'error',
                  summary: 'Unable to login',
                  detail: 'message' in e ? e.message : 'unknown error',
                  life: 5000,
                })
              }
            },
          },
        ],
)
</script>

<template>
  <Button icon="pi pi-user" text @click="menu.toggle($event)" />
  <Menu ref="menu" :popup="true" :model="items">
    <template #start>
      <LoadingBars v-if="isPending" />
      <div v-else-if="isError">
        <Message severity="error">Error! {{ error }}</Message>
      </div>
      <div class="flex gap-2 m-2" v-else-if="data">
        <Avatar :image="data.user.image" size="large" shape="circle" />
        <span class="inline-flex flex-col items-start">
          <span class="font-bold">{{ data.user.name }}</span>
          <span class="text-sm">{{ data.user.email }}</span>
        </span>
      </div>
    </template>
  </Menu>
</template>

<style scoped></style>
