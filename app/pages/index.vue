<template>
  <div class="max-w-md mx-auto p-4 space-y-6">
    <!-- Next Appointment -->
    <div class="bg-base-100 rounded-lg shadow p-4">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-semibold text-primary">📅 การนัดครั้งถัดไป</h3>
        <button v-if="appointments.length > 0" class="btn btn-primary btn-sm" @click="navigateTo('/appointment-history')">ดูทั้งหมด</button>
      </div>
      <div v-if="loadingAppointment" class="flex justify-center py-4">
        <span class="loading loading-spinner loading-md"></span>
      </div>
      <div v-else-if="nextAppointment" :class="isUrgent(nextAppointment.APP_DATE) ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'"
        class="rounded-lg p-4 border-2">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-sm font-medium text-gray-700">HN: {{ nextAppointment.hn || 'ไม่ระบุ' }}</span>
          <span class="text-xs text-gray-600">{{ nextAppointment.fullname }}</span>
          <span v-if="isUrgent(nextAppointment.APP_DATE)" class="badge badge-warning badge-sm ml-auto">ใกล้ถึงกำหนด</span>
        </div>
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xl">📅</span>
          <div>
            <div class="font-bold" :class="isUrgent(nextAppointment.APP_DATE) ? 'text-orange-700' : 'text-blue-700'">
              {{ formatAppDate(nextAppointment.APP_DATE) }}
            </div>
            <div class="text-xs text-gray-500">{{ getDaysUntil(nextAppointment.APP_DATE) }}</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xl">🕐</span>
          <span class="font-semibold" :class="isUrgent(nextAppointment.APP_DATE) ? 'text-orange-700' : 'text-blue-700'">
            เวลา {{ nextAppointment.APP_TIME || 'ไม่ระบุ' }} น.
          </span>
        </div>
        <div v-if="appointments.length > 1" class="text-xs text-gray-500 mt-2 text-center">
          มีการนัดหมายทั้งหมด {{ appointments.length }} ครั้ง
        </div>
      </div>
      <div v-else class="text-center py-4 text-gray-500">ไม่มีการนัดหมายในขณะนี้</div>
    </div>

    <!-- BEFAST Summary -->
    <div class="bg-base-100 rounded-lg shadow p-4">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-semibold text-primary">อาการโรคหลอดเลือดสมอง (BEFAST)</h3>
        <button class="btn btn-primary btn-sm" @click="navigateTo('/befast-history')">ดูรายละเอียด</button>
      </div>
      <div v-if="loadingBefast" class="text-center text-info py-4">กำลังโหลด...</div>
      <div v-else-if="lastBefast" class="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-amber-600">📅</span>
          <span class="text-xs text-gray-600 bg-white px-2 py-1 rounded-full">{{ formatDate(lastBefast.record_date || lastBefast.created_at) }}</span>
        </div>
        <div class="flex flex-wrap gap-1 mt-2">
          <span v-for="s in (lastBefast.symptoms || '').split(',')" :key="s"
            class="inline-block bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">
            {{ SYMPTOM_LABELS[s] || s }}
          </span>
        </div>
      </div>
      <div v-else class="text-center py-4 text-gray-500">ยังไม่มีข้อมูลอาการที่บันทึก</div>
    </div>

    <!-- ADL Latest -->
    <div class="bg-base-100 rounded-lg shadow p-4">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-semibold text-primary">การประเมิน ADL</h3>
        <button class="btn btn-primary btn-sm" @click="navigateTo('/adl-assessment-history')">ดูรายละเอียด</button>
      </div>
      <div v-if="loadingAdl" class="text-center text-info py-4">กำลังโหลด...</div>
      <div v-else-if="lastAdl" class="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-blue-600">📅</span>
          <span class="text-xs text-gray-600">{{ formatDate(String(lastAdl.created_at || '')) }}</span>
        </div>
        <div class="grid grid-cols-2 gap-4 text-center bg-white rounded-lg p-3 border">
          <div>
            <div class="text-xs text-gray-600 mb-1">คะแนน</div>
            <div class="text-lg font-bold text-blue-600">{{ lastAdl.total_score }} / {{ lastAdl.max_score }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-600 mb-1">ระดับการพึ่งพา</div>
            <div class="text-sm font-bold" :class="adlColorClass(lastAdl)">{{ lastAdl.dependency_level }}</div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-4 text-gray-500">ยังไม่มีข้อมูลการประเมิน</div>
    </div>

    <!-- Video Stats -->
    <div class="bg-base-100 rounded-lg shadow p-4">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-semibold text-primary">สถิติผลลัพธ์การเรียนรู้</h3>
        <button class="btn btn-primary btn-sm" @click="navigateTo('/video-stats-detail')">ดูรายละเอียด</button>
      </div>
      <div v-if="videoStats.length === 0" class="text-center py-4 text-gray-500">ยังไม่มีข้อมูลการรับชมวิดีโอ</div>
      <div v-else class="space-y-2">
        <div v-for="stat in videoStats.slice(0, 3)" :key="String(stat.video_id)"
          class="flex justify-between items-center bg-gray-50 rounded p-2">
          <span class="text-sm truncate flex-1 mr-2">{{ stat.video_title || stat.video_id }}</span>
          <span class="badge badge-primary badge-sm">{{ stat.view_count }} ครั้ง</span>
        </div>
      </div>
    </div>

    <!-- Nutrition Latest -->
    <div class="bg-base-100 rounded-lg shadow p-4">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-semibold text-primary">🍽️ การรับประทานอาหาร</h3>
        <button class="btn btn-primary btn-sm" @click="navigateTo('/health-record')">บันทึก</button>
      </div>
      <div v-if="lastNutrition" class="bg-orange-50 border border-orange-200 rounded-lg p-3">
        <div class="text-sm text-gray-600 mb-1">📅 {{ formatDate(lastNutrition.created_at) }}</div>
        <div class="font-bold text-orange-600">{{ nutritionLabel(lastNutrition.status) }}</div>
      </div>
      <div v-else class="text-center py-3 text-gray-500">ยังไม่มีข้อมูล</div>
    </div>

    <!-- Exercise Latest -->
    <div class="bg-base-100 rounded-lg shadow p-4">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-semibold text-primary">🏃‍♂️ การออกกำลังกาย</h3>
        <button class="btn btn-primary btn-sm" @click="navigateTo('/health-record')">บันทึก</button>
      </div>
      <div v-if="lastExercise" class="bg-green-50 border border-green-200 rounded-lg p-3">
        <div class="text-sm text-gray-600 mb-1">📅 {{ formatDate(lastExercise.created_at) }}</div>
        <div class="font-bold text-green-600">{{ exerciseLabel(lastExercise.status) }}</div>
      </div>
      <div v-else class="text-center py-3 text-gray-500">ยังไม่มีข้อมูล</div>
    </div>

    <!-- Medication Latest -->
    <div class="bg-base-100 rounded-lg shadow p-4">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-semibold text-primary">💊 การรับประทานยา</h3>
        <button class="btn btn-primary btn-sm" @click="navigateTo('/health-record')">บันทึก</button>
      </div>
      <div v-if="lastMedication" class="bg-red-50 border border-red-200 rounded-lg p-3">
        <div class="text-sm text-gray-600 mb-1">📅 {{ formatDate(lastMedication.created_at) }}</div>
        <div class="font-bold text-red-600">{{ medicationLabel(lastMedication.status) }}</div>
      </div>
      <div v-else class="text-center py-3 text-gray-500">ยังไม่มีข้อมูล</div>
    </div>

    <!-- Health Behavior Latest -->
    <div class="bg-base-100 rounded-lg shadow p-4">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-semibold text-primary">💪 พฤติกรรมสุขภาพ</h3>
        <button class="btn btn-primary btn-sm" @click="navigateTo('/health-behavior')">บันทึก</button>
      </div>
      <div v-if="lastBehavior" class="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <div class="text-sm text-gray-600 mb-1">📅 {{ formatDate(lastBehavior.created_at) }}</div>
        <div class="font-bold text-purple-600">{{ behaviorLabel(lastBehavior.behaviors) }}</div>
      </div>
      <div v-else class="text-center py-3 text-gray-500">ยังไม่มีข้อมูล</div>
    </div>

    <!-- Satisfaction Survey Latest -->
    <div class="bg-base-100 rounded-lg shadow p-4">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-semibold text-primary">😊 ความพึงพอใจ</h3>
        <button class="btn btn-primary btn-sm" @click="navigateTo('/satisfaction-survey')">ประเมิน</button>
      </div>
      <div v-if="lastSurvey" class="bg-pink-50 border border-pink-200 rounded-lg p-3">
        <div class="text-sm text-gray-600 mb-1">📅 {{ formatDate(lastSurvey.created_at) }}</div>
        <div class="font-bold text-pink-600">{{ surveyLabel(lastSurvey.ratings) }}</div>
      </div>
      <div v-else class="text-center py-3 text-gray-500">ยังไม่มีข้อมูล</div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const authStore = useAuthStore();
const pid = computed(() => authStore.getPid());

const SYMPTOM_LABELS: Record<string, string> = {
  B: "Balance (ทรงตัวไม่ได้)", E: "Eyes (ตามัว)", F: "Face (หน้าเบี้ยว)",
  A: "Arm (แขนขาอ่อนแรง)", S: "Speech (พูดลำบาก)", T: "Time (รีบไป รพ.)", NONE: "อาการทั่วไปปกติ"
};

interface Appointment { APP_DATE: string; APP_TIME: string; hn: string; fullname: string; }

const loadingAppointment = ref(true);
const appointments = ref<Appointment[]>([]);
const nextAppointment = computed(() => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return appointments.value.find(a => {
    if (!a?.APP_DATE) return false;
    const [d, m, y] = a.APP_DATE.split("/");
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return date >= now;
  }) ?? null;
});

function formatAppDate(dateString: string) {
  try {
    const [d, m, y] = dateString.split("/");
    return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString("th-TH", {
      year: "numeric", month: "long", day: "numeric", weekday: "long"
    });
  } catch { return dateString; }
}
function isUrgent(dateString: string) {
  try {
    const [d, m, y] = dateString.split("/");
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    const diff = Math.ceil((date.getTime() - Date.now()) / 86400000);
    return diff >= 0 && diff <= 7;
  } catch { return false; }
}
function getDaysUntil(dateString: string) {
  try {
    const [d, m, y] = dateString.split("/");
    const diff = Math.ceil((new Date(Number(y), Number(m) - 1, Number(d)).getTime() - Date.now()) / 86400000);
    if (diff === 0) return "วันนี้";
    if (diff === 1) return "พรุ่งนี้";
    if (diff < 0) return "ผ่านมาแล้ว";
    return `อีก ${diff} วัน`;
  } catch { return ""; }
}

const loadingBefast = ref(true);
const loadingAdl = ref(true);
const lastBefast = ref<Record<string, string> | null>(null);
const lastAdl = ref<Record<string, string | number> | null>(null);
const videoStats = ref<Record<string, string | number>[]>([]);
const lastNutrition = ref<Record<string, string> | null>(null);
const lastExercise = ref<Record<string, string> | null>(null);
const lastMedication = ref<Record<string, string> | null>(null);
const lastBehavior = ref<Record<string, string> | null>(null);
const lastSurvey = ref<Record<string, string> | null>(null);

function formatDate(d?: string) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("th-TH");
}
function adlColorClass(row: Record<string, string | number>) {
  const p = row.max_score ? (Number(row.total_score) / Number(row.max_score)) * 100 : 0;
  if (p >= 80) return "text-green-700";
  if (p >= 60) return "text-yellow-700";
  if (p >= 40) return "text-orange-700";
  return "text-red-700";
}
function nutritionLabel(s?: string) {
  const m: Record<string, string> = { normal_full: "อาหารครบ 5 หมู่", normal_notfull: "อาหารไม่ครบ 5 หมู่", less: "ทานได้น้อย", cannot: "ไม่สามารถทานได้" };
  return s ? (m[s] || s) : "-";
}
function exerciseLabel(s?: string) {
  const m: Record<string, string> = { daily: "ทำทุกวัน", regular: "ทำสม่ำเสมอ", none: "ไม่ได้ทำ" };
  return s ? (m[s] || s) : "-";
}
function medicationLabel(s?: string) {
  const m: Record<string, string> = { taken: "รับประทานครบถ้วน", partial: "รับประทานบางส่วน", missed: "ลืมรับประทาน", stopped: "หยุดรับประทาน" };
  return s ? (m[s] || s) : "-";
}
function behaviorLabel(b?: string) {
  if (!b) return "-";
  try {
    const obj = JSON.parse(b);
    const keys = ["medication","control_risk","diet_control","exercise","avoid_smoking_alcohol","warning_symptoms","sleep_enough","manage_stress"];
    const follow = keys.filter(k => obj[k] === "follow" || (k === "warning_symptoms" && obj[k] === "no_symptoms")).length;
    const pct = (follow / keys.length) * 100;
    if (pct >= 90) return "ดีเยี่ยม";
    if (pct >= 75) return "ดี";
    if (pct >= 50) return "พอใช้";
    return "ต้องปรับปรุง";
  } catch { return "-"; }
}
function surveyLabel(r?: string) {
  if (!r) return "-";
  try {
    const obj = JSON.parse(r);
    const vals = Object.values(obj).filter((v): v is number => typeof v === "number" && v > 0);
    if (!vals.length) return "-";
    const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
    return `เฉลี่ย ${avg.toFixed(1)}/5`;
  } catch { return "-"; }
}

onMounted(async () => {
  const p = pid.value;
  if (!p) return;
  $fetch<{ success: boolean; data?: Appointment[] }>(`/api/appointment?pid=${encodeURIComponent(p)}`)
    .then(res => {
      if (res.success && res.data) appointments.value = res.data;
    })
    .catch(() => {})
    .finally(() => { loadingAppointment.value = false; });
  const [befastRes, adlRes, statsRes, nutriRes, exRes, medRes, behavRes, surveyRes] = await Promise.allSettled([
    $fetch<{ success: boolean; data?: Record<string, string>[] }>(`/api/befast?pid=${encodeURIComponent(p)}`),
    $fetch<{ success: boolean; assessments?: Record<string, Record<string, string | number>> }>(`/api/adl-assessment?pid=${encodeURIComponent(p)}`),
    $fetch<{ success: boolean; data?: Record<string, string | number>[] }>(`/api/video-view-stats?pid=${encodeURIComponent(p)}`),
    $fetch<{ success: boolean; data?: Record<string, string>[] }>(`/api/nutrition-record?pid=${encodeURIComponent(p)}`),
    $fetch<{ success: boolean; data?: Record<string, string>[] }>(`/api/exercise-record?pid=${encodeURIComponent(p)}`),
    $fetch<{ success: boolean; data?: Record<string, string>[] }>(`/api/medication-record?pid=${encodeURIComponent(p)}`),
    $fetch<{ success: boolean; data?: Record<string, string>[] }>(`/api/health-behavior?pid=${encodeURIComponent(p)}`),
    $fetch<{ success: boolean; data?: Record<string, string>[] }>(`/api/satisfaction-survey?pid=${encodeURIComponent(p)}`),
  ]);
  loadingBefast.value = false;
  loadingAdl.value = false;
  if (befastRes.status === "fulfilled" && befastRes.value.success && befastRes.value.data?.length) {
    lastBefast.value = [...befastRes.value.data].sort((a, b) => (b.record_date || b.created_at || "").localeCompare(a.record_date || a.created_at || ""))[0] ?? null;
  }
  if (adlRes.status === "fulfilled" && adlRes.value.success && adlRes.value.assessments) {
    const entries = Object.values(adlRes.value.assessments).sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
    if (entries.length) lastAdl.value = entries[0] as Record<string, string | number>;
  }
  if (statsRes.status === "fulfilled" && statsRes.value.success) videoStats.value = statsRes.value.data || [];
  if (nutriRes.status === "fulfilled" && nutriRes.value.success && nutriRes.value.data?.length) lastNutrition.value = nutriRes.value.data[0] ?? null;
  if (exRes.status === "fulfilled" && exRes.value.success && exRes.value.data?.length) lastExercise.value = exRes.value.data[0] ?? null;
  if (medRes.status === "fulfilled" && medRes.value.success && medRes.value.data?.length) lastMedication.value = medRes.value.data[0] ?? null;
  if (behavRes.status === "fulfilled" && behavRes.value.success && behavRes.value.data?.length) lastBehavior.value = behavRes.value.data[0] ?? null;
  if (surveyRes.status === "fulfilled" && surveyRes.value.success && surveyRes.value.data?.length) lastSurvey.value = surveyRes.value.data[0] ?? null;
});
</script>
