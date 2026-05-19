<template>
  <div class="max-w-md mx-auto px-4 py-6">
    <button class="btn btn-ghost btn-sm mb-4" @click="navigateTo(`/admin/patient/${nationalId}`)">← กลับ</button>

    <div class="flex items-center gap-2 mb-4">
      <span class="text-primary text-xl">🎬</span>
      <h1 class="text-xl font-bold">รายละเอียดการดูวิดีโอ</h1>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <template v-else>
      <!-- Summary -->
      <div class="bg-blue-50 rounded-lg p-4 mb-6">
        <h2 class="text-base font-bold text-primary mb-3">📊 สถิติรวมการดูวิดีโอ</h2>
        <div class="grid grid-cols-2 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-blue-600">{{ allVideos.length }}</div>
            <div class="text-sm text-base-content/60">วิดีโอทั้งหมด</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-green-600">{{ totalViews }}</div>
            <div class="text-sm text-base-content/60">ครั้งที่ดู</div>
          </div>
        </div>
      </div>

      <!-- Grouped sections -->
      <div v-for="group in groups" :key="group.label" class="mb-6">
        <h2 class="text-base font-bold text-primary mb-2">{{ group.emoji }} {{ group.label }}</h2>
        <div class="bg-base-100 rounded-lg shadow border border-base-300 overflow-hidden">
          <div
            v-for="v in group.videos"
            :key="v.video_id"
            class="flex items-start gap-3 p-3 border-b border-base-200 last:border-b-0"
          >
            <div class="flex-1 min-w-0">
              <p class="text-sm leading-snug text-base-content wrap-break-word">{{ v.title }}</p>
            </div>
            <div class="shrink-0 text-right">
              <span class="badge badge-primary whitespace-nowrap">{{ getCount(v.video_id) }} ครั้ง</span>
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
const viewMap = ref<Record<number, number>>({});

const groups = [
  {
    label: 'วิดีโอความรู้เกี่ยวกับโรคหลอดเลือดสมอง',
    emoji: '📚',
    videos: [
      { video_id: 1,   title: '1. สัญญาณเตือนอาการโรคหลอดเลือดสมอง (BEFAST)' },
      { video_id: 2,   title: '2. การป้องกันโรคหลอดเลือดสมองกลับมาเป็นซ้ำ' },
    ],
  },
  {
    label: 'วิดีโอออกกำลังกาย / กายภาพบำบัด',
    emoji: '🏃',
    videos: [
      { video_id: 100, title: 'กายภาพบำบัด สำหรับผู้ป่วยโรคหลอดเลือดสมอง : [ชุดความรู้ STROKE-05]' },
      { video_id: 101, title: 'การออกกำลังกายด้วยตัวเองในผู้ป่วยโรคหลอดเลือดสมอง | งานกายภาพบำบัด โรงพยาบาลราชวิถี' },
      { video_id: 102, title: 'การจัดท่านอนหงายและการพลิกตะแคงตัวในผู้ป่วยโรคหลอดเลือดสมอง | งานกายภาพบำบัด โรงพยาบาลราชวิถี' },
      { video_id: 103, title: 'การเคลื่อนไหวข้อต่อโดยญาติ/ผู้ดูแลในผู้ป่วยโรคหลอดเลือดสมอง | งานกายภาพบำบัด โรงพยาบาลราชวิถี' },
      { video_id: 104, title: 'การออกกำลังกาย สำหรับผู้ป่วยโรคหลอดเลือดสมองที่บ้าน' },
      { video_id: 105, title: 'การฝึกพูดสำหรับผู้ป่วยโรคหลอดเลือดสมอง' },
      { video_id: 106, title: '10 ท่า ทรงตัวมั่นคง ยืนเดินปลอดภัย | งานกายภาพบำบัด โรงพยาบาลราชวิถี' },
    ],
  },
  {
    label: 'วิดีโออาหารและโภชนาการ',
    emoji: '🥗',
    videos: [
      { video_id: 200, title: 'โภชนาการสำหรับผู้ป่วยโรคหลอดเลือดสมอง' },
      { video_id: 201, title: 'อาหารที่ควรหลีกเลี่ยงสำหรับผู้ป่วยโรคหลอดเลือดสมอง' },
    ],
  },
  {
    label: 'วิดีโอความรู้เรื่องยา',
    emoji: '💊',
    videos: [
      { video_id: 300, title: 'ความรู้เรื่องยาสำหรับผู้ป่วยโรคหลอดเลือดสมอง' },
    ],
  },
  {
    label: 'วิดีโอเสริมพลังใจ',
    emoji: '💪',
    videos: [
      { video_id: 400, title: 'เสริมพลังใจสำหรับผู้ป่วยโรคหลอดเลือดสมอง' },
      { video_id: 401, title: 'กำลังใจและแรงบันดาลใจ' },
      { video_id: 402, title: 'พลังใจในการฟื้นฟู' },
    ],
  },
];

const allVideos = groups.flatMap(g => g.videos);
const totalViews = computed(() => Object.values(viewMap.value).reduce((s, c) => s + c, 0));

function getCount(videoId: number): number {
  return viewMap.value[videoId] || 0;
}

onMounted(async () => {
  try {
    const res = await $fetch<{ success: boolean; data?: { video_id: number; view_count: number }[] }>(
      `/api/video-view-stats?pid=${encodeURIComponent(nationalId)}`
    );
    if (res.success && res.data) {
      const map: Record<number, number> = {};
      for (const row of res.data) map[Number(row.video_id)] = row.view_count;
      viewMap.value = map;
    }
  } finally {
    loading.value = false;
  }
});
</script>
