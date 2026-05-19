<template>
  <div class="p-4 md:p-6">
    <div class="flex items-center gap-3 mb-6">
      <button class="btn btn-ghost btn-sm" @click="navigateTo('/admin/dashboard')">← กลับ</button>
      <h2 class="text-xl font-bold">รายละเอียดผู้ป่วย</h2>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <template v-else>
      <!-- Patient info card -->
      <div class="card bg-base-100 shadow mb-4">
        <div class="card-body p-4">
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
              :class="genderBg(personinfo?.gender)">
              {{ genderEmoji(personinfo?.gender) }}
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-lg">{{ personinfo?.name_th || "ไม่ระบุชื่อ" }}</h3>
              <div class="text-xs text-base-content/50 mb-2">รหัส: {{ formatPid(nationalId) }}</div>
              <div class="flex flex-wrap gap-2">
                <span class="badge badge-ghost badge-sm">{{ genderLabel(personinfo?.gender) }}</span>
                <span v-if="personinfo?.birthdate" class="badge badge-info badge-sm">{{ getAge(personinfo.birthdate) }} ปี</span>
                <span v-if="personinfo?.occupation" class="badge badge-ghost badge-sm">{{ personinfo.occupation }}</span>
                <span v-if="personinfo?.education" class="badge badge-ghost badge-sm">{{ personinfo.education }}</span>
              </div>
            </div>
            <div class="shrink-0">
              <a v-if="personinfo?.phone" :href="`tel:${personinfo.phone}`"
                class="btn btn-success btn-sm gap-1">📞 โทร</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Nav buttons to sub-pages -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        <button class="btn btn-outline btn-sm" @click="navigateTo(`/admin/patient/${nationalId}/befast-history`)">
          🧠 BEFAST <span class="badge badge-sm ml-1">{{ data?.befast?.length || 0 }}</span>
        </button>
        <button class="btn btn-outline btn-sm" @click="navigateTo(`/admin/patient/${nationalId}/adl-assessment`)">
          📋 ADL <span class="badge badge-sm ml-1">{{ data?.adl?.length || 0 }}</span>
        </button>
        <button class="btn btn-outline btn-sm" @click="navigateTo(`/admin/patient/${nationalId}/exercise-records`)">
          🏃 ออกกำลังกาย <span class="badge badge-sm ml-1">{{ data?.exercise?.length || 0 }}</span>
        </button>
        <button class="btn btn-outline btn-sm" @click="navigateTo(`/admin/patient/${nationalId}/nutrition-records`)">
          🥗 โภชนาการ <span class="badge badge-sm ml-1">{{ data?.nutrition?.length || 0 }}</span>
        </button>
        <button class="btn btn-outline btn-sm" @click="navigateTo(`/admin/patient/${nationalId}/medication-records`)">
          💊 ยา <span class="badge badge-sm ml-1">{{ data?.medication?.length || 0 }}</span>
        </button>
        <button class="btn btn-outline btn-sm" @click="navigateTo(`/admin/patient/${nationalId}/health-behavior`)">
          🧘 พฤติกรรมสุขภาพ <span class="badge badge-sm ml-1">{{ data?.behavior?.length || 0 }}</span>
        </button>
        <button class="btn btn-outline btn-sm" @click="navigateTo(`/admin/patient/${nationalId}/satisfaction-survey`)">
          📝 ความพึงพอใจ <span class="badge badge-sm ml-1">{{ data?.survey?.length || 0 }}</span>
        </button>
        <button class="btn btn-outline btn-sm" @click="navigateTo(`/admin/patient/${nationalId}/video-stats`)">
          🎬 วิดีโอ <span class="badge badge-sm ml-1">{{ data?.videoStats?.length || 0 }}</span>
        </button>
        <button class="btn btn-outline btn-sm" @click="navigateTo(`/admin/patient/${nationalId}/appointment-history`)">
          📅 นัดหมาย
        </button>
      </div>

      <!-- BEFAST latest -->
      <div v-if="data?.befast?.length" class="card bg-amber-50 shadow mb-3">
        <div class="card-body p-4">
          <div class="font-semibold text-sm mb-2">🧠 BEFAST ล่าสุด</div>
          <div class="flex flex-wrap gap-1 mb-1">
            <span v-for="s in (data.befast[0]?.symptoms || '').split(',')" :key="s"
              class="badge badge-warning badge-sm">{{ SYMPTOM_LABELS[s] || s }}</span>
          </div>
          <div class="text-xs text-gray-500">{{ formatDate(data.befast[0]?.record_date) }}</div>
          <div v-if="data.befast[0]?.note" class="text-xs text-gray-600 mt-1">{{ data.befast[0].note }}</div>
        </div>
      </div>

      <!-- ADL latest -->
      <div v-if="latestAdl" class="card bg-blue-50 shadow mb-3">
        <div class="card-body p-4">
          <div class="font-semibold text-sm mb-2">📋 ADL ล่าสุด</div>
          <div class="flex items-center gap-3">
            <div class="text-center">
              <div class="text-xs text-gray-500">คะแนน</div>
              <div class="font-bold text-blue-600">{{ latestAdl.total_score }}/{{ latestAdl.max_score }}</div>
            </div>
            <div class="divider divider-horizontal"></div>
            <div class="text-center">
              <div class="text-xs text-gray-500">ระดับ</div>
              <div class="font-bold text-sm" :class="adlColor(latestAdl)">{{ latestAdl.dependency_level }}</div>
            </div>
          </div>
          <div class="text-xs text-gray-500 mt-1">{{ formatDate(latestAdl.created_at) }}</div>
        </div>
      </div>

      <!-- Video stats -->
      <div v-if="data?.videoStats?.length" class="card bg-purple-50 shadow mb-3">
        <div class="card-body p-4">
          <div class="font-semibold text-sm mb-2">🎬 วิดีโอที่ดูมากที่สุด</div>
          <div class="space-y-1">
            <div v-for="vs in data.videoStats.slice(0, 3)" :key="String(vs.video_id)"
              class="flex items-center justify-between text-sm">
              <span class="truncate flex-1 text-gray-700">{{ vs.video_title || vs.video_id }}</span>
              <span class="badge badge-purple badge-sm ml-2 shrink-0">{{ vs.view_count }} ครั้ง</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });

const route = useRoute();
const nationalId = String(route.params.nationalId);
const loading = ref(true);

interface ActivityData {
  personinfo?: Record<string, string> | null;
  befast?: Record<string, string>[];
  adl?: Record<string, string>[];
  exercise?: Record<string, string>[];
  nutrition?: Record<string, string>[];
  medication?: Record<string, string>[];
  behavior?: Record<string, string>[];
  survey?: Record<string, string>[];
  videoStats?: Record<string, string | number>[];
}

const data = ref<ActivityData | null>(null);
const personinfo = computed(() => data.value?.personinfo || null);
const latestAdl = computed(() => data.value?.adl?.[0] || null);

const SYMPTOM_LABELS: Record<string, string> = {
  B: "Balance", E: "Eyes", F: "Face", A: "Arm", S: "Speech", T: "Time", NONE: "ปกติ"
};

function formatPid(pid: string) {
  if (!pid || pid.length < 7) return pid || "-";
  return pid.slice(0, 3) + "XXXX" + pid.slice(-4);
}

function formatDate(d?: string) {
  return d ? new Date(d).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }) : "-";
}

function getAge(birthdate?: string) {
  if (!birthdate) return "-";
  const diff = Date.now() - new Date(birthdate).getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
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

function adlColor(r: Record<string, string>) {
  const p = r.max_score ? (Number(r.total_score) / Number(r.max_score)) * 100 : 0;
  if (p >= 80) return "text-green-700";
  if (p >= 60) return "text-yellow-700";
  if (p >= 40) return "text-orange-700";
  return "text-red-700";
}

onMounted(async () => {
  try {
    const res = await $fetch<{ success: boolean; data?: ActivityData }>(`/api/admin/patient-activities?pid=${encodeURIComponent(nationalId)}`);
    if (res.success) data.value = res.data || null;
  } finally { loading.value = false; }
});
</script>
