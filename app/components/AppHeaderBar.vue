<template>
  <div class="navbar bg-primary text-primary-content shadow-sm sticky top-0 z-40">
    <div class="flex-1">
      <span class="text-lg font-bold">ระบบติดตามสุขภาพโรคหลอดเลือดสมอง</span>
    </div>
    <div class="flex-none">
      <div class="dropdown dropdown-end">
        <button tabindex="0" class="btn btn-ghost btn-circle" aria-label="menu">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-5 w-5 stroke-current">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <ul tabindex="0" class="dropdown-content menu bg-base-100 text-base-content rounded-box shadow-sm w-40 mt-2 p-2 z-50">
          <li>
            <button class="text-error" @click="navigateTo('/logout')">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-4 w-4 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
              </svg>
              ออกจากระบบ
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "AppHeaderBar" });
</script>
