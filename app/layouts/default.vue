<template>
  <div class="min-h-screen flex flex-col bg-base-200 pb-16">
    <AppHeaderBar />
    <main class="flex-1 w-full max-w-md mx-auto px-2 pt-2">
      <slot />
    </main>
    <AppMobileNavbar />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "DefaultLayout" });
</script>
