<template>
  <div>
    <!-- Latest result -->
    <div v-if="latest" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-blue-600">📅</span>
        <span class="text-sm font-semibold">วันที่ประเมินล่าสุด: {{ formatDate(String(latest.created_at || '')) }}</span>
      </div>
      <div class="bg-white rounded-lg p-3 border text-center">
        <div class="text-xs text-gray-600 mb-2">ผลการประเมินครั้งล่าสุด</div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-xs text-gray-600 mb-1">คะแนน</div>
            <div class="text-lg font-bold text-blue-600">{{ latest.total_score }} / {{ latest.max_score }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-600 mb-1">ระดับการพึ่งพา</div>
            <div class="text-sm font-bold" :class="adlColor(latest)">{{ latest.dependency_level }}</div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-gray-500 mb-4">ยังไม่มีข้อมูลการประเมิน</div>

    <h3 class="text-md font-bold text-primary mb-3">📝 แบบประเมิน ADL</h3>
    <table class="table table-xs w-full mb-4">
      <thead>
        <tr><th class="w-1/2">กิจกรรม</th><th>เลือก</th></tr>
      </thead>
      <tbody>
        <tr v-for="(q, idx) in QUESTIONS" :key="q.key"
          :class="idx % 2 === 0 ? 'bg-base-100' : 'bg-base-200'">
          <td class="py-2 align-top text-xs">{{ q.label }}</td>
          <td class="py-2">
            <div class="flex flex-col gap-1">
              <label v-for="c in CHOICES" :key="c.value" class="flex items-center gap-1 text-xs cursor-pointer">
                <input type="radio" :name="q.key" :value="c.value"
                  :checked="String(answers[q.key]) === String(c.value)"
                  :disabled="alreadySavedToday"
                  @change="answers[q.key] = c.value" />
                {{ c.label }}
              </label>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="bg-base-200 rounded-lg p-3 mb-4 text-center">
      <span class="text-sm">คะแนนรวม: </span>
      <span class="font-bold text-primary">{{ total }} / {{ maxScore }}</span>
      <span class="ml-2 text-sm">({{ percent.toFixed(1) }}%)</span>
      <div class="mt-1 font-semibold" :class="levelColor">{{ level }}</div>
    </div>

    <button class="btn btn-primary w-full" :disabled="!allAnswered || alreadySavedToday || saving" @click="handleSave">
      {{ alreadySavedToday ? "บันทึกได้วันละ 1 ครั้ง" : saving ? "กำลังบันทึก..." : "บันทึกข้อมูล" }}
    </button>
    <div v-if="msg" :class="['text-center mt-2 text-sm', msgError ? 'text-error' : 'text-success']">{{ msg }}</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ pid: string }>();

const QUESTIONS = [
  { key: "eat", label: "รับประทานอาหารเมื่อเตรียมไว้ให้เรียบร้อย (Eating)" },
  { key: "hygiene", label: "การล้างหน้า หวีผม แปรงฟัน โกนหนวด (Personal Hygiene)" },
  { key: "dress", label: "ลุกนั่งจากที่นอน เตียงไปยังเก้าอี้ (Transferring)" },
  { key: "toilet", label: "การใช้ห้องน้ำ (Toileting)" },
  { key: "walk", label: "การเคลื่อนที่ภายในห้องหรือบ้าน (Walking)" },
  { key: "dressing", label: "การสวมใส่เสื้อผ้า (Dressing)" },
  { key: "stairs", label: "การขึ้นลงบันได 1ชั้น (Stair Climbing)" },
  { key: "bath", label: "การอาบน้ำ (Bathing)" },
  { key: "bowel_control", label: "การกลั้นถ่ายอุจจาระใน1สัปดาห์ (Bowel Control)" },
  { key: "bladder_control", label: "การกลั้นปัสสาวะใน1สัปดาห์ (Bladder Control)" },
];
const CHOICES = [
  { value: 2, label: "ทำได้เอง" },
  { value: 1, label: "ต้องการความช่วยเหลือบางส่วน" },
  { value: 0, label: "ต้องการความช่วยเหลือทั้งหมด" },
];

const answers = reactive<Record<string, number | string>>({});
const latest = ref<Record<string, string | number> | null>(null);
const saving = ref(false);
const msg = ref("");
const msgError = ref(false);

const total = computed(() => QUESTIONS.reduce((s, q) => s + (Number(answers[q.key]) || 0), 0));
const maxScore = QUESTIONS.length * 2;
const percent = computed(() => (total.value / maxScore) * 100);
const level = computed(() => {
  const p = percent.value;
  if (p >= 80) return "ช่วยเหลือตนเองได้ (Independent)";
  if (p >= 60) return "พึ่งพาบางส่วน (Partially Dependent)";
  if (p >= 40) return "พึ่งพามาก (Severely Dependent)";
  return "พึ่งพาโดยสมบูรณ์ (Total Dependent)";
});
const levelColor = computed(() => {
  const p = percent.value;
  if (p >= 80) return "text-green-700";
  if (p >= 60) return "text-yellow-700";
  if (p >= 40) return "text-orange-700";
  return "text-red-700";
});
const allAnswered = computed(() => QUESTIONS.every(q => answers[q.key] !== undefined && answers[q.key] !== ""));
const alreadySavedToday = computed(() => {
  if (!latest.value?.created_at) return false;
  return String(latest.value.created_at).slice(0, 10) === new Date().toISOString().slice(0, 10);
});

function formatDate(d: string) {
  if (!d) return "-";
  return new Date(d).toLocaleString("th-TH");
}
function adlColor(row: Record<string, string | number>) {
  const p = row.max_score ? (Number(row.total_score) / Number(row.max_score)) * 100 : 0;
  if (p >= 80) return "text-green-700";
  if (p >= 60) return "text-yellow-700";
  if (p >= 40) return "text-orange-700";
  return "text-red-700";
}

async function fetchLatest() {
  if (!props.pid) return;
  const res = await $fetch<{ success: boolean; assessments?: Record<string, Record<string, string | number>> }>(`/api/adl-assessment?pid=${encodeURIComponent(props.pid)}`);
  if (res.success && res.assessments) {
    const entries = Object.values(res.assessments).sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
    latest.value = entries[0] ?? null;
  }
}

async function handleSave() {
  if (!props.pid) { msg.value = "ไม่พบรหัสผู้ใช้งาน"; msgError.value = true; return; }
  saving.value = true; msg.value = ""; msgError.value = false;
  try {
    const res = await $fetch<{ success: boolean; message?: string }>("/api/adl-assessment", {
      method: "POST",
      body: { patient_id: props.pid, answers }
    });
    if (res.success) {
      msg.value = "บันทึกข้อมูลสำเร็จ"; msgError.value = false;
      QUESTIONS.forEach(q => { delete answers[q.key]; });
      await fetchLatest();
    } else { msg.value = res.message || "เกิดข้อผิดพลาด"; msgError.value = true; }
  } catch { msg.value = "เกิดข้อผิดพลาด"; msgError.value = true; }
  finally { saving.value = false; }
}

onMounted(fetchLatest);
</script>
