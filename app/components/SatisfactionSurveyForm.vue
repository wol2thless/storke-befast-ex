<template>
  <div>
    <h2 class="text-lg font-bold text-primary mb-4">ประเมินความพึงพอใจ</h2>

    <!-- Latest -->
    <div v-if="latest" class="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-4">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-pink-600">📅</span>
        <span class="text-sm font-semibold">ล่าสุด: {{ formatDate(latest.created_at || '') }}</span>
      </div>
      <div class="bg-white rounded-lg p-3 border text-center">
        <div class="text-xs text-gray-600 mb-1">คะแนนเฉลี่ย</div>
        <div class="font-bold text-pink-600">{{ avgRating(latest.ratings) }}/5</div>
      </div>
    </div>

    <!-- Questions -->
    <div class="space-y-4">
      <div v-for="q in QUESTIONS" :key="q.key" class="bg-white rounded-lg p-4 shadow border border-gray-100">
        <div class="font-semibold text-sm mb-3">{{ q.label }}</div>
        <div class="grid grid-cols-5 gap-1">
          <button v-for="opt in RATING_OPTIONS" :key="opt.value" type="button"
            :class="['btn btn-sm flex flex-col h-auto py-2 px-1', ratings[q.key] === opt.value ? `${opt.activeClass} text-white` : 'btn-outline']"
            :disabled="alreadySubmittedToday"
            @click="ratings[q.key] = opt.value">
            <div class="text-lg font-bold">{{ opt.value }}</div>
            <div class="text-xs leading-tight">{{ opt.label }}</div>
          </button>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <div class="bg-white rounded-lg p-4 shadow border border-gray-100">
        <div class="font-bold text-sm mb-2">💬 ความคิดเห็นเพิ่มเติม</div>
        <textarea class="textarea textarea-bordered w-full resize-none" rows="3"
          placeholder="กรุณาแสดงความคิดเห็นเพิ่มเติม" v-model="additionalComment" :disabled="alreadySubmittedToday" />
      </div>
    </div>

    <div class="mt-4">
      <div class="bg-white rounded-lg p-4 shadow border border-gray-100">
        <div class="font-bold text-sm mb-2">🛡️ ความคิดเห็นเกี่ยวกับการป้องกันการกลับมาเป็นซ้ำ</div>
        <div class="text-xs text-gray-600 mb-2">ท่านคิดว่าแอปพลิเคชันนี้สามารถช่วยป้องกันการกลับมาเป็นซ้ำได้ กรุณาระบุเหตุผล</div>
        <textarea class="textarea textarea-bordered w-full resize-none" rows="4"
          placeholder="กรุณาระบุเหตุผล" v-model="preventionComment" :disabled="alreadySubmittedToday" />
      </div>
    </div>

    <div class="mt-6">
      <button class="btn btn-success w-full h-12 text-base font-bold"
        :disabled="!allAnswered || saving || alreadySubmittedToday" @click="handleSubmit">
        {{ alreadySubmittedToday ? "📝 ส่งแบบสำรวจได้วันละ 1 ครั้ง" : saving ? "⏳ กำลังบันทึก..." : "📤 ส่งแบบสำรวจ" }}
      </button>
      <div v-if="msg" :class="['text-center mt-3 p-3 rounded-lg font-semibold text-sm', msgError ? 'text-error bg-red-50 border border-red-200' : 'text-success bg-green-50 border border-green-200']">{{ msg }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ pid: string }>();

const QUESTIONS = [
  { key: "accessibility", label: "การเข้าถึงแอปพลิเคชันได้สะดวก" },
  { key: "knowledge_content", label: "แอปพลิเคชันมีเนื้อหาด้านความรู้เรื่องโรคหลอดเลือดสมองที่เหมาะสม ครอบคลุม" },
  { key: "health_behavior", label: "แอปพลิเคชันมีเนื้อหาด้านการปรับพฤติกรรมการดูแลสุขภาพที่เหมาะสม ครอบคลุม" },
  { key: "usage_time", label: "ระยะเวลาการใช้งานแอปพลิเคชันมีความเหมาะสม" },
  { key: "overall_satisfaction", label: "ความพึงพอใจภาพรวมของแอปพลิเคชัน" },
];
const RATING_OPTIONS = [
  { value: 5, label: "มากที่สุด", activeClass: "bg-green-500 border-green-500" },
  { value: 4, label: "มาก", activeClass: "bg-blue-500 border-blue-500" },
  { value: 3, label: "ปานกลาง", activeClass: "bg-yellow-500 border-yellow-500" },
  { value: 2, label: "น้อย", activeClass: "bg-orange-500 border-orange-500" },
  { value: 1, label: "น้อยที่สุด", activeClass: "bg-red-500 border-red-500" },
];

const ratings = reactive<Record<string, number>>({});
const additionalComment = ref("");
const preventionComment = ref("");
const saving = ref(false);
const msg = ref("");
const msgError = ref(false);
const latest = ref<Record<string, string> | null>(null);
const allAnswered = computed(() => QUESTIONS.every(q => ratings[q.key]));
const alreadySubmittedToday = computed(() => !!latest.value?.created_at && latest.value.created_at.slice(0, 10) === new Date().toISOString().slice(0, 10));

function formatDate(d: string) { return d ? new Date(d).toLocaleString("th-TH") : "-"; }
function avgRating(r?: string) {
  if (!r) return "0";
  try {
    const obj = JSON.parse(r);
    const vals = Object.values(obj).filter((v): v is number => typeof v === "number" && v > 0);
    return vals.length ? (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1) : "0";
  } catch { return "0"; }
}

async function fetchLatest() {
  if (!props.pid) return;
  const res = await $fetch<{ success: boolean; data?: Record<string, string>[] }>(`/api/satisfaction-survey?pid=${encodeURIComponent(props.pid)}`);
  if (res.success && res.data?.length) latest.value = res.data[0] ?? null;
}

async function handleSubmit() {
  if (!props.pid) { msg.value = "ไม่พบรหัสผู้ใช้งาน"; msgError.value = true; return; }
  saving.value = true; msg.value = ""; msgError.value = false;
  try {
    const res = await $fetch<{ success: boolean; message?: string }>("/api/satisfaction-survey", {
      method: "POST",
      body: { pid: props.pid, ratings: JSON.stringify(ratings), additional_comment: additionalComment.value, prevention_comment: preventionComment.value }
    });
    if (res.success) {
      msg.value = "บันทึกแบบสำรวจสำเร็จ"; msgError.value = false;
      QUESTIONS.forEach(q => { delete ratings[q.key]; });
      additionalComment.value = ""; preventionComment.value = "";
      await fetchLatest();
    } else { msg.value = res.message || "เกิดข้อผิดพลาด"; msgError.value = true; }
  } catch { msg.value = "เกิดข้อผิดพลาด"; msgError.value = true; }
  finally { saving.value = false; }
}

onMounted(fetchLatest);
</script>
