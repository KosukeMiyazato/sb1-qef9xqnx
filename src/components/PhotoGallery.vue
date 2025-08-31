<template>
  <div class="space-y-6">
    <div v-if="photoStore.photos.length === 0" class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div class="flex items-center gap-2">
        <Image class="w-4 h-4 text-blue-600" />
        <p class="text-blue-700">
          まだ写真がアップロードされていません。「アップロード」タブから写真を追加してください。
        </p>
      </div>
    </div>

    <div v-else>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">写真ギャラリー</h2>
        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm border border-gray-300 text-gray-700">
          {{ photoStore.photos.length }}枚の写真
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="photo in photoStore.photos"
          :key="photo.id"
          class="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div class="aspect-square relative">
            <img
              :src="photo.imageUrl"
              :alt="photo.filename"
              class="w-full h-full object-cover"
            />
            <div class="absolute top-2 right-2 flex gap-2">
              <button
                @click="viewPhoto(photo)"
                class="h-8 w-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white transition-colors"
              >
                <Eye class="w-4 h-4" />
              </button>
              <button
                @click="editPhoto(photo.id)"
                class="h-8 w-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white transition-colors"
              >
                <Edit3 class="w-4 h-4" />
              </button>
              <button
                @click="deletePhoto(photo.id)"
                class="h-8 w-8 bg-red-500/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-red-500 text-white transition-colors"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="p-4">
            <div class="space-y-3">
              <div class="flex items-center gap-2 text-sm text-gray-500">
                <Calendar class="w-4 h-4" />
                {{ formatDate(photo.uploadDate) }}
              </div>
              
              <div class="space-y-2">
                <div
                  v-for="[key, value] in Object.entries(photo.extractedData).slice(0, 3)"
                  :key="key"
                  class="flex justify-between text-sm"
                >
                  <span class="font-medium text-gray-700">{{ key }}:</span>
                  <span class="text-gray-600 truncate ml-2">
                    {{ value || '未検出' }}
                  </span>
                </div>
                <p v-if="Object.keys(photo.extractedData).length > 3" class="text-xs text-gray-500">
                  +{{ Object.keys(photo.extractedData).length - 3 }}項目
                </p>
              </div>
            </div>

            <!-- Edit Mode -->
            <div v-if="editingPhoto === photo.id" class="mt-4 pt-4 border-t space-y-3">
              <h4 class="text-sm font-medium">情報を編集</h4>
              <div v-for="key in Object.keys(photo.extractedData)" :key="key" class="space-y-1">
                <label class="text-xs text-gray-600">{{ key }}</label>
                <input
                  v-model="editData[key]"
                  :placeholder="`${key}を入力`"
                  class="w-full h-8 px-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div class="flex gap-2">
                <button
                  @click="saveEdit"
                  class="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 transition-colors"
                >
                  保存
                </button>
                <button
                  @click="cancelEdit"
                  class="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- View Modal -->
    <div
      v-if="viewingPhoto"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      @click="closeView"
    >
      <div
        class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
        @click.stop
      >
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">{{ viewingPhoto.filename }}</h3>
            <button
              @click="closeView"
              class="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <img
                :src="viewingPhoto.imageUrl"
                :alt="viewingPhoto.filename"
                class="w-full rounded-lg"
              />
            </div>
            <div class="space-y-4">
              <h4 class="font-semibold">抽出された情報</h4>
              <div class="space-y-2">
                <div
                  v-for="[key, value] in Object.entries(viewingPhoto.extractedData)"
                  :key="key"
                  class="grid grid-cols-3 gap-2"
                >
                  <span class="text-sm font-medium">{{ key }}:</span>
                  <span class="col-span-2 text-sm">{{ value || '未検出' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Image, Edit3, Trash2, Calendar, Eye, X } from 'lucide-vue-next'
import { usePhotoStore, type Photo } from '@/stores/photoStore'

const photoStore = usePhotoStore()

const editingPhoto = ref<string | null>(null)
const editData = ref<Record<string, string>>({})
const viewingPhoto = ref<Photo | null>(null)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ja-JP')
}

const editPhoto = (photoId: string) => {
  const photo = photoStore.photos.find(p => p.id === photoId)
  if (photo) {
    editingPhoto.value = photoId
    editData.value = { ...photo.extractedData }
  }
}

const saveEdit = () => {
  if (editingPhoto.value) {
    photoStore.updatePhoto(editingPhoto.value, { extractedData: editData.value })
    editingPhoto.value = null
    editData.value = {}
  }
}

const cancelEdit = () => {
  editingPhoto.value = null
  editData.value = {}
}

const deletePhoto = (photoId: string) => {
  photoStore.deletePhoto(photoId)
}

const viewPhoto = (photo: Photo) => {
  viewingPhoto.value = photo
}

const closeView = () => {
  viewingPhoto.value = null
}
</script>