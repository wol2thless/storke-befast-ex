<template>
  <div class="max-w-md mx-auto px-4 py-6">
    <button class="btn btn-ghost btn-sm mb-4" @click="navigateTo(`/admin/patient/${nationalId}`)">← กลับ</button>
    <h1 class="text-xl font-bold text-primary mb-4">รายละเอียดแบบสำรวจความพึงพอใจ</h1>

    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else-if="!records.length" class="bg-base-100 rounded-lg shadow p-6 text-center text-base-content/60">
      ยังไม่มีข้อมูลแบบสำรวจความพึงพอใจ
    </div>

    <div v-else class="space-y-4">
      <div v-for="(rec, index) in records" :key="rec.id" class="bg-base-100 rounded-lg shadow p-4">

        <!-- Header row: survey number + date + average -->
        <div class="flex justify-between items-start mb-3">
          <div>
            <div class="text-sm font-medium text-base-content">การสำรวจครั้งที่ {{ records.length - index }}</div>
            <div class="text-xs text-base-content/60">{{ formatDate(rec.created_at) }}</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-green-600">{{ avgExact(rec.ratings) }}/5</div>
            <div class="text-xs text-base-content/60">คะแนนเฉลี่ย</div>
          </div>
        </div>

        <!-- Per-question ratings -->
        <div class="space-y-2 mb-3">
          <div v-for="item in getRatingDisplay(rec.ratings)" :key="item.key"
            class="border-l-4 pl-3 py-1"
            :class="item.score >= 4 ? 'border-green-400' : item.score >= 3 ? 'border-yellow-400' : 'border-red-400'"
          >
            <div class="text-sm font-medium text-base-content">{{ item.question }}</div>
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold"
                :class="item.score >= 4 ? 'text-green-600' : item.score >= 3 ? 'text-yellow-600' : 'text-red-600'"
              >{{ item.rating }}</span>
              <div class="flex gap-0.5">
                <div v-for="star in 5" :key="star"
                  class="w-2.5 h-2.5 rounded-full"
                  :class="star <= item.score ? 'bg-yellow-400' : 'bg-base-300'"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary: high / low / count -->
        <div v-if="getRatingDisplay(rec.ratings).length" class="bg-green-50 rounded p-3 mb-3">
          <div class="text-sm font-semibold text-green-800 mb-2">สรุปผลการสำรวจ:</div>
          <div class="grid grid-cols-3 gap-2 text-xs">
            <div class="text-green-600">คะแนนสูง: {{ maxScore(rec.ratings) }}/5</div>
            <div class="text-yellow-600">คะแนนต่ำ: {{ minScore(rec.ratings) }}/5</div>
            <div class="text-blue-600">จำนวนข้อ: {{ getRatingDisplay(rec.ratings).length }}</div>
          </div>
        </div>

        <!-- Additional comment -->
        <div v-if="rec.additional_comment" class="bg-base-200 rounded p-3 mb-2">
          <div class="text-sm font-semibold text-base-content mb-1">💬 ความคิดเห็นเพิ่มเติม:</div>
          <div class="text-sm text-base-content/80">{{ rec.additional_comment }}</div>
        </div>

        <!-- Prevention comment -->
        <div v-if="rec.prevention_comment" class="bg-blue-50 rounded p-3">
          <div class="text-sm font-semibold text-base-content mb-1">🛡️ ความคิดเห็นเกี่ยวกับการป้องกันการกลับมาเป็นซ้ำ:</div>
          <div class="text-sm text-base-content/80">{{ rec.prevention_comment }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });

interface SurveyRecord {
  id: number;
  created_at?: string;
  ratings?: string;
  additional_comment?: string;
  prevention_comment?: string;
}

const SURVEY_QUESTIONS = [
  { key: 'accessibility',        label: 'การเข้าถึงแอปพลิเคชันได้สะดวก' },
  { key: 'knowledge_content',    label: 'แอปพลิเคชันมีเนื้อหาด้านความรู้เรื่องโรคหลอดเลือดสมองที่เหมาะสม ครอบคลุม' },
  { key: 'health_behavior',      label: 'แอปพลิเคชันมีเนื้อหาด้านการปรับพฤติกรรมการดูแลสุขภาพที่เหมาะสม ครอบคลุม' },
  { key: 'usage_time',           label: 'ระยะเวลาการใช้งานแอปพลิเคชันมีความเหมาะสม' },
  { key: 'overall_satisfaction', label: 'ความพึงพอใจภาพรวมของแอปพลิเคชัน' },
];

const RATING_LABELS: Record<number, string> = {
  5: 'พึงพอใจมากที่สุด',
  4: 'พึงพอใจมาก',
  3: 'พึงพอใจปานกลาง',
  2: 'พึงพอใจน้อย',
  1: 'พึงพอใจน้อยที่สุด',
};

const route = useRoute();
const nationalId = String(route.params.nationalId);
const loading = ref(true);
const records = ref<SurveyRecord[]>([]);

function formatDate(d?: string) {
  return d ? new Date(d).toLocaleString('th-TH') : '-';
}

function parseRatings(r?: string): Record<string, number> {
  if (!r) return {};
  try { return JSON.parse(r); } catch { return {}; }
}

function getRatingDisplay(r?: string) {
  const ratings = parseRatings(r);
  return SURVEY_QUESTIONS
    .map(q => ({ key: q.key, question: q.label, score: Number(ratings[q.key]) || 0, rating: RATING_LABELS[Number(ratings[q.key])] || '' }))
    .filter(item => item.score > 0);
}

function avgExact(r?: string) {
  const vals = getRatingDisplay(r).map(i => i.score);
  if (!vals.length) return '0.0';
  return (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1);
}

function maxScore(r?: string) {
  const vals = getRatingDisplay(r).map(i => i.score);
  return vals.length ? Math.max(...vals) : 0;
}

function minScore(r?: string) {
  const vals = getRatingDisplay(r).map(i => i.score);
  return vals.length ? Math.min(...vals) : 0;
}

onMounted(async () => {
  try {
    const res = await $fetch<{ success: boolean; data?: SurveyRecord[] }>(
      `/api/satisfaction-survey?pid=${encodeURIComponent(nationalId)}`
    );
    if (res.success) records.value = res.data || [];
  } finally {
    loading.value = false;
  }
});
</script>
