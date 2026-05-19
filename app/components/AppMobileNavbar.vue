<template>
  <nav class="dock dock-sm">
    <button
      v-for="item in navItems"
      :key="item.to"
      :class="[
        isActive(item.to) ? 'dock-active' : '',
        isBlocked && item.to !== '/person-info' ? 'opacity-60 cursor-not-allowed' : '',
      ]"
      :disabled="isBlocked && item.to !== '/person-info'"
      @click="handleNav(item.to)"
    >
      <component :is="item.icon" />
      <span class="dock-label">{{ item.label }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { h } from "vue";

const route = useRoute();
const authStore = useAuthStore();
const personInfoComplete = useState('personInfoComplete', () => false);
const isBlocked = computed(() => !personInfoComplete.value);

const icon = (path: string) => () =>
  h("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", class: "size-[1.2em] stroke-current", "stroke-width": "1.5" },
    [h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", d: path })]
  );

const navItems = [
  { to: "/",                  label: "หน้าหลัก",          icon: icon("M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25") },
  { to: "/health-behavior",   label: "พฤติกรรมสุขภาพ",    icon: icon("M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z") },
  { to: "/health-record",     label: "บันทึกสุขภาพ",      icon: icon("M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z") },
  { to: "/video-library",     label: "วิดีโอ",             icon: icon("M21 12a9 9 0 11-18 0 9 9 0 0118 0z M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z") },
  { to: "/satisfaction-survey", label: "ประเมินความพึงพอใจ", icon: icon("M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z") },
  { to: "/person-info",       label: "ข้อมูลส่วนตัว",      icon: icon("M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z") },
];

function isActive(path: string) {
  return route.path === path;
}

async function handleNav(to: string) {
  if (isBlocked.value && to !== "/person-info") {
    alert("กรุณาอัปเดตข้อมูลผู้ใช้งานให้ครบถ้วนก่อนใช้งานเมนูอื่น");
    return;
  }
  await navigateTo(to);
}

onMounted(async () => {
  const pid = authStore.getPid();
  if (!pid) return;
  try {
    const res = await $fetch<{ success: boolean; data?: { occupation?: string } }>(
      `/api/personinfo?pid=${encodeURIComponent(pid)}`
    );
    personInfoComplete.value = !!(res?.success && res?.data?.occupation);
  } catch { /* ignore */ }
});
</script>
