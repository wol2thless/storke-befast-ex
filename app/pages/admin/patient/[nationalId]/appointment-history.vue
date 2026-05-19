<template>
  <div class="max-w-md mx-auto px-4 py-6">
    <button class="btn btn-ghost btn-sm mb-4" @click="navigateTo(`/admin/patient/${nationalId}`)">← กลับ</button>
    <h1 class="text-xl font-bold mb-4">📅 ประวัติการนัดหมาย</h1>

    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else-if="appointments.length === 0" class="text-center py-12 text-base-content/50">
      <div class="text-4xl mb-3">📅</div>
      <p>ไม่มีประวัติการนัดหมาย</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Upcoming -->
      <div v-if="upcomingAppointments.length > 0">
        <h3 class="text-base font-bold text-green-600 mb-3">การนัดที่กำลังจะมาถึง ({{ upcomingAppointments.length }})</h3>
        <div class="space-y-3">
          <div v-for="(appt, i) in upcomingAppointments" :key="i"
            class="rounded-lg p-4 border-2"
            :class="getStatus(appt.APP_DATE) === 'today' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium">HN: {{ appt.hn || 'ไม่ระบุ' }}</span>
              <span v-if="getStatus(appt.APP_DATE) === 'today'" class="badge badge-error badge-sm">วันนี้</span>
              <span v-else class="badge badge-success badge-sm">{{ getDaysUntil(appt.APP_DATE) }}</span>
            </div>
            <div class="text-xs text-base-content/60 mb-2">{{ appt.fullname }}</div>
            <div class="font-bold" :class="getStatus(appt.APP_DATE) === 'today' ? 'text-red-700' : 'text-green-700'">
              📅 {{ formatAppDate(appt.APP_DATE) }}
            </div>
            <div class="font-semibold mt-1" :class="getStatus(appt.APP_DATE) === 'today' ? 'text-red-700' : 'text-green-700'">
              🕐 เวลา {{ appt.APP_TIME || 'ไม่ระบุ' }} น.
            </div>
          </div>
        </div>
      </div>

      <!-- Past -->
      <div v-if="pastAppointments.length > 0">
        <h3 class="text-base font-bold text-base-content/60 mb-3">การนัดที่ผ่านมาแล้ว ({{ pastAppointments.length }})</h3>
        <div class="space-y-3">
          <div v-for="(appt, i) in pastAppointments" :key="i"
            class="rounded-lg p-4 border-2 bg-base-200 border-base-300 opacity-75">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium">HN: {{ appt.hn || 'ไม่ระบุ' }}</span>
              <span class="badge badge-outline badge-sm">{{ getDaysUntil(appt.APP_DATE) }}</span>
            </div>
            <div class="text-xs text-base-content/60 mb-2">{{ appt.fullname }}</div>
            <div class="font-bold text-base-content/70">📅 {{ formatAppDate(appt.APP_DATE) }}</div>
            <div class="font-semibold text-base-content/70 mt-1">🕐 เวลา {{ appt.APP_TIME || 'ไม่ระบุ' }} น.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });

const route = useRoute();
const nationalId = route.params.nationalId as string;

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
  } catch { return "past"; }
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
      year: "numeric", month: "long", day: "numeric", weekday: "long",
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
  if (!nationalId) { loading.value = false; return; }
  try {
    const res = await $fetch<{ success: boolean; data?: Appointment[] }>(
      `/api/appointment?pid=${encodeURIComponent(nationalId)}`
    );
    if (res.success && res.data) appointments.value = res.data;
  } catch { /* silent */ }
  finally { loading.value = false; }
});
</script>
