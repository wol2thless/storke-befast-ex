<template>
  <div class="p-4 md:p-6">
    <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
      <h2 class="text-2xl font-bold flex-1">👥 รายการผู้ป่วย</h2>
      <div class="flex gap-2">
        <input v-model="search" type="text" placeholder="ค้นหาชื่อ หรือรหัสประชาชน"
          class="input input-bordered input-sm flex-1 min-w-0" @keyup.enter="doSearch" />
        <button class="btn btn-primary btn-sm" @click="doSearch">ค้นหา</button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else-if="!patients.length" class="text-center py-12 text-base-content/50">
      <div class="text-4xl mb-3">🔍</div>
      <div>ไม่พบข้อมูลผู้ป่วย</div>
    </div>

    <!-- Mobile cards -->
    <div v-else class="space-y-3">
      <div v-for="p in patients" :key="p.pid"
        class="card bg-base-100 shadow hover:shadow-md transition-shadow cursor-pointer"
        @click="navigateTo(`/admin/patient/${p.pid}`)">
        <div class="card-body p-4">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg"
              :class="genderBg(p.gender)">
              {{ genderEmoji(p.gender) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-bold text-base truncate">{{ p.name_th || "ไม่ระบุชื่อ" }}</div>
              <div class="text-xs text-base-content/50 mt-0.5">รหัส: {{ formatPid(p.pid) }}</div>
              <div class="flex flex-wrap gap-2 mt-2">
                <span class="badge badge-ghost badge-sm">{{ genderLabel(p.gender) }}</span>
                <span v-if="p.occupation" class="badge badge-ghost badge-sm truncate max-w-30">{{ p.occupation }}</span>
                <span v-if="p.education" class="badge badge-ghost badge-sm">{{ p.education }}</span>
              </div>
            </div>
            <div class="flex flex-col gap-1 items-end shrink-0">
              <a v-if="p.phone" :href="`tel:${p.phone}`"
                class="btn btn-success btn-xs gap-1"
                @click.stop>
                📞 โทร
              </a>
              <button class="btn btn-primary btn-xs" @click.stop="navigateTo(`/admin/patient/${p.pid}`)">
                ดูข้อมูล →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex justify-center items-center gap-2 mt-6">
      <button class="btn btn-sm btn-outline" :disabled="page <= 1" @click="page--; fetchPatients()">← ก่อนหน้า</button>
      <span class="text-sm font-medium px-3">หน้า {{ page }}</span>
      <button class="btn btn-sm btn-outline" :disabled="patients.length < 20" @click="page++; fetchPatients()">ถัดไป →</button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });

const search = ref("");
const loading = ref(true);
const patients = ref<Record<string, string>[]>([]);
const page = ref(1);

function formatPid(pid?: string) {
  if (!pid || pid.length < 7) return pid || "-";
  return pid.slice(0, 3) + "XXXX" + pid.slice(-4);
}

function genderLabel(g?: string) {
  const gl = String(g || "").toLowerCase();
  if (["male","m","ชาย"].includes(gl)) return "ชาย";
  if (["female","f","หญิง"].includes(gl)) return "หญิง";
  return "ไม่ระบุ";
}

function genderEmoji(g?: string) {
  const gl = String(g || "").toLowerCase();
  if (["male","m","ชาย"].includes(gl)) return "👨";
  if (["female","f","หญิง"].includes(gl)) return "👩";
  return "👤";
}

function genderBg(g?: string) {
  const gl = String(g || "").toLowerCase();
  if (["male","m","ชาย"].includes(gl)) return "bg-blue-100";
  if (["female","f","หญิง"].includes(gl)) return "bg-pink-100";
  return "bg-gray-100";
}

function doSearch() { page.value = 1; fetchPatients(); }

async function fetchPatients() {
  loading.value = true;
  try {
    const params = new URLSearchParams({ page: String(page.value), limit: "20" });
    if (search.value) params.set("search", search.value);
    const res = await $fetch<{ success: boolean; data?: Record<string, string>[] }>(`/api/admin/patients?${params}`);
    if (res.success) patients.value = res.data || [];
  } finally { loading.value = false; }
}

onMounted(fetchPatients);
</script>
