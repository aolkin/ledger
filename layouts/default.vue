<script setup lang="ts"></script>

<template>
  <div class="h-dvh flex flex-col">
    <Toolbar class="!rounded-none !p-0 !border-x-0 sticky top-0 z-50">
      <template #start>
        <Button as="router-link" to="/ledgers" icon="pi pi-book" text />
      </template>
      <template #center>
        <Button as="router-link" to="/" icon="pi pi-list" text />
      </template>
      <template #end>
        <Button as="router-link" to="activities" icon="pi pi-cog" text />
      </template>
    </Toolbar>
    <slot />
  </div>
</template>

<style scoped></style>
