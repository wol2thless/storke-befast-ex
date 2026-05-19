<template>
  <div class="max-w-md mx-auto p-4">
    <button class="btn btn-ghost btn-sm mb-4" @click="navigateTo('/')">← กลับ</button>
    <div class="flex items-center gap-2 mb-6">
      <span class="text-2xl">📅</span>
      <h1 class="text-2xl font-bold text-primary">ประวัติการนัด</h1>
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="appointments.length === 0" class="text-center py-8">
      <div class="text-5xl mb-4">📅</div>
      <h3 class="text-lg font-semibold text-gray-600 mb-2">ไม่มีการนัดหมาย</h3>
      <p class="text-gray-500">ยังไม่มีประวัติการนัดหมายในขณะนี้</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Upcoming -->
      <div v-if="upcomingAppointments.length > 0">
        <h2 class="text-lg font-bold text-green-600 mb-3 flex items-center gap-2">
          <span>📅</span> การนัดที่กำลังจะมาถึง ({{ upcomingAppointments.length }})
        </h2>
        <div class="space-y-3">
          <div v-for="(appt, i) in upcomingAppointments" :key="i"
            :class="getStatus(appt.APP_DATE) === 'today' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'"
            class="rounded-lg p-4 border-2">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-sm font-medium text-gray-700">HN: {{ appt.hn || 'ไม่ระบุ' }}</span>
              <div class="text-xs text-gray-600 ml-1">{{ appt.fullname }}</div>
              <span v-if="getStatus(appt.APP_DATE) === 'today'" class="badge badge-error badge-sm ml-auto">วันนี้</span>
              <span v-else class="badge badge-success badge-sm ml-auto">{{ getDaysUntil(appt.APP_DATE) }}</span>
            </div>
            <div class="flex items-center gap-2 mb-2">
              <span :class="getStatus(appt.APP_DATE) === 'today' ? 'text-red-600' : 'text-green-600'" class="text-xl">📅</span>
              <div class="font-bold" :class="getStatus(appt.APP_DATE) === 'today' ? 'text-red-700' : 'text-green-700'">
                {{ formatAppDate(appt.APP_DATE) }}
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span :class="getStatus(appt.APP_DATE) === 'today' ? 'text-red-600' : 'text-green-600'" class="text-xl">🕐</span>
              <span class="font-semibold" :class="getStatus(appt.APP_DATE) === 'today' ? 'text-red-700' : 'text-green-700'">
                เวลา {{ appt.APP_TIME || 'ไม่ระบุ' }} น.
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Past -->
      <div v-if="pastAppointments.length > 0">
        <h2 class="text-lg font-bold text-gray-600 mb-3 flex items-center gap-2">
          <span>📅</span> การนัดที่ผ่านมาแล้ว ({{ pastAppointments.length }})
        </h2>
        <div class="space-y-3">
          <div v-for="(appt, i) in pastAppointments" :key="i"
            class="rounded-lg p-4 border-2 bg-gray-50 border-gray-200 opacity-75">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-sm font-medium text-gray-700">HN: {{ appt.hn || 'ไม่ระบุ' }}</span>
              <div class="text-xs text-gray-600 ml-1">{{ appt.fullname }}</div>
              <span class="badge badge-outline badge-sm ml-auto">{{ getDaysUntil(appt.APP_DATE) }}</span>
            </div>
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xl">📅</span>
              <div class="font-bold text-gray-700">{{ formatAppDate(appt.APP_DATE) }}</div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xl">🕐</span>
              <span class="font-semibold text-gray-700">เวลา {{ appt.APP_TIME || 'ไม่ระบุ' }} น.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const authStore = useAuthStore();
const pid = computed(() => authStore.getPid());

interface Appointment { APP_DATE: string; APP_TIME: string; hn: string; fullname: string; }

const loading = ref(true);
const appointments = ref<Appointment[]>([]);

function getStatus(dateString: string): "past" | "today" | "future" {
  try {
    const [d, m, y] = dateString.split("/");
    const apptDate = new Date(Number(y), Number(m) - 1, Number(d));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    apptDate.setHours(0, 0, 0, 0);
    if (apptDate < today) return "past";
    if (apptDate.getTime() === today.getTime()) return "today";
    return "future";
  } catch { return "unknown" as never; }
}

function getDaysUntil(dateString: string) {
  try {
    const [d, m, y] = dateString.split("/");
    const diff = Math.ceil((new Date(Number(y), Number(m) - 1, Number(d)).getTime() - Date.now()) / 86400000);
    if (diff === 0) return "วันนี้";
    if (diff === 1) return "พรุ่งนี้";
    if (diff < 0) return `ผ่านมาแล้ว ${Math.abs(diff)} วัน`;
    return `อีก ${diff} วัน`;
  } catch { return ""; }
}

function formatAppDate(dateString: string) {
  try {
    const [d, m, y] = dateString.split("/");
    return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString("th-TH", {
      year: "numeric", month: "long", day: "numeric", weekday: "long"
    });
  } catch { return dateString; }
}

const upcomingAppointments = computed(() =>
  appointments.value.filter(a => a?.APP_DATE && ["today", "future"].includes(getStatus(a.APP_DATE)))
);
const pastAppointments = computed(() =>
  appointments.value.filter(a => a?.APP_DATE && getStatus(a.APP_DATE) === "past")
);

onMounted(async () => {
  const p = pid.value;
  if (!p) { loading.value = false; return; }
  try {
    const res = await $fetch<{ success: boolean; data?: Appointment[] }>(`/api/appointment?pid=${encodeURIComponent(p)}`);
    if (res.success && res.data) appointments.value = res.data;
  } catch { /* silent */ }
  finally { loading.value = false; }
});
</script>
