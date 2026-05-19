<template>
  <div class="max-w-2xl mx-auto p-3">
    <h2 class="text-xl font-bold text-primary mb-1">📚 คลังวีดีโอความรู้</h2>
    <p class="text-gray-500 text-sm mb-4">วีดีโอความรู้เกี่ยวกับโรคหลอดเลือดสมองและการดูแลสุขภาพ</p>

    <!-- YouTube Channel -->
    <div class="mb-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 text-center">
      <div class="text-2xl mb-2">📺</div>
      <h3 class="text-base font-bold text-blue-700 mb-1">ช่อง YouTube กายภาพบำบัด</h3>
      <p class="text-gray-600 text-xs mb-3">รับชมวิดีโอความรู้จากโรงพยาบาลหาดใหญ่</p>
      <a href="https://www.youtube.com/channel/UC8fuC9Nv4TEaivtDhMslm1w" target="_blank" rel="noopener noreferrer"
        class="btn btn-primary btn-sm font-bold">
        ดูช่อง YouTube
      </a>
      <div class="text-xs text-gray-500 mt-1">กายภาพบำบัด โรงพยาบาลหาดใหญ่</div>
    </div>

    <!-- Search -->
    <div class="relative mb-4">
      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
      <input v-model="searchTerm" type="text" placeholder="ค้นหาวีดีโอ..."
        class="input input-bordered w-full pl-9 text-sm" />
      <button v-if="searchTerm" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg leading-none"
        @click="searchTerm = ''">×</button>
    </div>

    <!-- Category grid -->
    <div v-if="!searchTerm && !selectedCategory" class="space-y-3">
      <div v-for="cat in VIDEO_CATEGORIES" :key="cat.id" class="bg-white rounded-xl shadow border overflow-hidden">
        <!-- Category header -->
        <div class="px-4 pt-4 pb-2">
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <h2 class="text-base font-bold text-primary leading-tight">{{ cat.title }}</h2>
              <p class="text-gray-500 text-xs mt-0.5">{{ cat.description }}</p>
            </div>
            <button class="btn btn-outline btn-primary btn-xs shrink-0 mt-0.5"
              @click="selectedCategory = cat">ดูทั้งหมด</button>
          </div>
          <div class="text-xs text-gray-400 mt-1">{{ cat.videos.length }} วีดีโอ</div>
        </div>

        <!-- Preview videos -->
        <div class="divide-y divide-gray-100">
          <div v-for="video in cat.videos.slice(0, 3)" :key="video.numericId"
            class="px-4 py-3 flex items-center gap-3 active:bg-gray-50"
            @click="openVideo(video.youtubeId, video.numericId, video.title)">
            <!-- Play icon -->
            <div class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span class="text-primary text-sm">▶</span>
            </div>
            <!-- Title -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-800 leading-snug line-clamp-2">{{ video.title }}</p>
              <p v-if="getViewCount(video.numericId) > 0" class="text-xs text-gray-400 mt-0.5">
                ดูแล้ว {{ getViewCount(video.numericId) }} ครั้ง
              </p>
            </div>
          </div>
        </div>

        <div v-if="cat.videos.length > 3"
          class="px-4 py-2 text-center text-xs text-primary font-medium border-t border-gray-100 bg-gray-50"
          @click="selectedCategory = cat">
          และอีก {{ cat.videos.length - 3 }} วีดีโอ →
        </div>
      </div>
    </div>

    <!-- Selected category detail -->
    <div v-else-if="selectedCategory && !searchTerm">
      <div class="flex items-center gap-2 mb-3">
        <button class="btn btn-ghost btn-sm" @click="selectedCategory = null">←</button>
        <h2 class="text-base font-bold text-primary leading-tight">{{ selectedCategory.title }}</h2>
      </div>
      <p class="text-gray-500 text-xs mb-3 pl-1">{{ selectedCategory.description }}</p>
      <div class="bg-white rounded-xl shadow border overflow-hidden divide-y divide-gray-100">
        <div v-for="video in selectedCategory.videos" :key="video.numericId"
          class="px-4 py-3 flex items-center gap-3 active:bg-gray-50"
          @click="openVideo(video.youtubeId, video.numericId, video.title)">
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span class="text-primary">▶</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-800 leading-snug">{{ video.title }}</p>
            <p class="text-xs text-red-500 mt-0.5">ดูแล้ว {{ getViewCount(video.numericId) }} ครั้ง</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Search results -->
    <div v-else-if="searchTerm">
      <div v-if="filteredVideos.length === 0" class="text-center py-10">
        <div class="text-4xl mb-3">🔍</div>
        <p class="text-gray-500 text-sm mb-3">ไม่พบวีดีโอที่ตรงกับ "{{ searchTerm }}"</p>
        <button class="btn btn-primary btn-sm" @click="searchTerm = ''">ล้างการค้นหา</button>
      </div>
      <div v-else>
        <p class="text-xs text-gray-500 mb-2 pl-1">พบ {{ filteredVideos.length }} วีดีโอ</p>
        <div class="bg-white rounded-xl shadow border overflow-hidden divide-y divide-gray-100">
          <div v-for="video in filteredVideos" :key="video.numericId"
            class="px-4 py-3 flex items-center gap-3 active:bg-gray-50"
            @click="openVideo(video.youtubeId, video.numericId, video.title)">
            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span class="text-primary">▶</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-800 leading-snug">{{ video.title }}</p>
              <p class="text-xs text-red-500 mt-0.5">ดูแล้ว {{ getViewCount(video.numericId) }} ครั้ง</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Video Overlay -->
    <Teleport to="body">
      <div v-if="activeVideo" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
        @click="closeVideo">
        <div class="relative w-full max-w-4xl mx-3" @click.stop>
          <button class="absolute -top-9 right-0 text-white text-3xl leading-none hover:text-gray-300 z-10"
            @click="closeVideo">×</button>
          <div class="aspect-video w-full">
            <iframe :src="`https://www.youtube.com/embed/${activeVideo}?autoplay=1`"
              class="w-full h-full rounded-lg" frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const authStore = useAuthStore();
const pid = computed(() => authStore.getPid());

interface VideoItem { numericId: number; youtubeId: string; title: string; }
interface Category { id: string; title: string; description: string; videos: VideoItem[]; }

const VIDEO_CATEGORIES: Category[] = [
  {
    id: "stroke_education",
    title: "📚 วีดีโอความรู้โรคหลอดเลือดสมอง",
    description: "ความรู้เกี่ยวกับโรคหลอดเลือดสมอง การป้องกัน และการดูแล",
    videos: [
      { numericId: 1, youtubeId: "sbwXklQK3v8", title: "1. สัญญาณเตือนอาการโรคหลอดเลือดสมอง (BEFAST)" },
      { numericId: 2, youtubeId: "AJ503g2k9Zc", title: "2. การป้องกันโรคหลอดเลือดสมองกลับมาเป็นซ้ำ" },
    ],
  },
  {
    id: "exercise_education",
    title: "🏃‍♂️ วีดีโอการออกกำลังกาย",
    description: "การออกกำลังกายและการทำกายภาพบำบัดสำหรับผู้ป่วยโรคหลอดเลือดสมอง",
    videos: [
      { numericId: 100, youtubeId: "ls0ZUehgiMA", title: "กายภาพบำบัด สำหรับผู้ป่วยโรคหลอดเลือดสมอง : [ชุดความรู้ STROKE-05]" },
      { numericId: 101, youtubeId: "eEmeOHis4bE", title: "การออกกำลังกายด้วยตัวเองในผู้ป่วยโรคหลอดเลือดสมอง | งานกายภาพบำบัด โรงพยาบาลราชวิถี" },
      { numericId: 102, youtubeId: "LU1XdGeOwIA", title: "การจัดท่านอนหงายและการพลิกตะแคงตัวในผู้ป่วยโรคหลอดเลือดสมอง | งานกายภาพบำบัด โรงพยาบาลราชวิถี" },
      { numericId: 103, youtubeId: "6zgNn1alhIM", title: "การเคลื่อนไหวข้อต่อโดยญาติ/ผู้ดูแลในผู้ป่วยโรคหลอดเลือดสมอง | งานกายภาพบำบัด โรงพยาบาลราชวิถี" },
      { numericId: 104, youtubeId: "5Fv59zZ9h0w", title: "การออกกำลังกาย สำหรับผู้ป่วยโรคหลอดเลือดสมองที่บ้าน" },
      { numericId: 105, youtubeId: "_fG04RU1kJg", title: "การฝึกพูดสำหรับผู้ป่วยโรคหลอดเลือดสมอง" },
      { numericId: 106, youtubeId: "PAG5s56afcU", title: "10 ท่า ทรงตัวมั่นคง ยืนเดินปลอดภัย | งานกายภาพบำบัด โรงพยาบาลราชวิถี" },
    ],
  },
  {
    id: "nutrition_education",
    title: "🍎 วีดีโอโภชนาการ",
    description: "การรับประทานอาหารและการโภชนาการสำหรับผู้ป่วยโรคหลอดเลือดสมอง",
    videos: [
      { numericId: 200, youtubeId: "cD7HPKx6Agk", title: "โภชนาการสำหรับผู้ป่วยโรคหลอดเลือดสมอง" },
      { numericId: 201, youtubeId: "GPnej-kGLd4", title: "อาหารที่ควรหลีกเลี่ยงสำหรับผู้ป่วยโรคหลอดเลือดสมอง" },
    ],
  },
  {
    id: "medication_education",
    title: "💊 วีดีโอความรู้เรื่องยา",
    description: "ความรู้เกี่ยวกับยาที่ใช้ในการรักษาโรคหลอดเลือดสมอง",
    videos: [
      { numericId: 300, youtubeId: "CJKZwk4ayZQ", title: "ความรู้เรื่องยาสำหรับผู้ป่วยโรคหลอดเลือดสมอง" },
    ],
  },
  {
    id: "motivation_education",
    title: "💪 วีดีโอเสริมพลังใจ",
    description: "วีดีโอให้กำลังใจและเสริมพลังใจสำหรับผู้ป่วยโรคหลอดเลือดสมอง",
    videos: [
      { numericId: 400, youtubeId: "9zpZX0Msraw", title: "เสริมพลังใจสำหรับผู้ป่วยโรคหลอดเลือดสมอง" },
      { numericId: 401, youtubeId: "CO7A7SfW838", title: "กำลังใจและแรงบันดาลใจ" },
      { numericId: 402, youtubeId: "IezdiAqkdCo", title: "พลังใจในการฟื้นฟู" },
    ],
  },
];

const ALL_VIDEOS = VIDEO_CATEGORIES.flatMap(c => c.videos);

const searchTerm = ref("");
const selectedCategory = ref<Category | null>(null);
const activeVideo = ref<string | null>(null);
const viewCounts = ref<Record<string, number>>({});

const filteredVideos = computed(() =>
  ALL_VIDEOS.filter(v => v.title.toLowerCase().includes(searchTerm.value.toLowerCase()))
);

async function fetchStats() {
  if (!pid.value) return;
  try {
    const res = await $fetch<{ success: boolean; data?: { video_id: string; view_count: number }[] }>(
      `/api/video-view-stats?pid=${encodeURIComponent(pid.value)}`
    );
    if (res.success && res.data) {
      const map: Record<string, number> = {};
      res.data.forEach(s => { map[String(s.video_id)] = Number(s.view_count) || 0; });
      viewCounts.value = map;
    }
  } catch { /* silent */ }
}

function getViewCount(numericId: number) {
  return viewCounts.value[String(numericId)] || 0;
}

async function openVideo(youtubeId: string, numericId: number, title: string) {
  activeVideo.value = youtubeId;
  if (pid.value) {
    try {
      await $fetch("/api/video-view-log", {
        method: "POST",
        body: { pid: pid.value, video_id: String(numericId), video_title: title }
      });
      await fetchStats();
    } catch { /* silent */ }
  }
}

function closeVideo() {
  activeVideo.value = null;
}

onMounted(fetchStats);
</script>
