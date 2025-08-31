<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <div class="flex items-center gap-2 mb-6">
        <Download class="w-5 h-5 text-primary-600" />
        <h2 class="text-xl font-semibold">データエクスポート</h2>
      </div>

      <div v-if="photoStore.photos.length > 0" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center space-y-4">
            <FileText class="w-12 h-12 mx-auto text-green-600" />
            <div>
              <h3 class="font-semibold">CSV形式</h3>
              <p class="text-sm text-gray-600">
                Excelで開けるスプレッドシート形式
              </p>
            </div>
            <button
              @click="exportToCSV"
              class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              CSVでダウンロード
            </button>
          </div>

          <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center space-y-4">
            <Database class="w-12 h-12 mx-auto text-blue-600" />
            <div>
              <h3 class="font-semibold">JSON形式</h3>
              <p class="text-sm text-gray-600">
                プログラムで処理しやすいデータ形式
              </p>
            </div>
            <button
              @click="exportToJSON"
              class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              JSONでダウンロード
            </button>
          </div>
        </div>

        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-medium mb-2">エクスポート統計</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span class="text-gray-600">写真数:</span>
              <span class="font-medium ml-2">{{ photoStore.photos.length }}枚</span>
            </div>
            <div>
              <span class="text-gray-600">フィールド数:</span>
              <span class="font-medium ml-2">{{ photoStore.fields.length }}項目</span>
            </div>
            <div>
              <span class="text-gray-600">最新アップロード:</span>
              <span class="font-medium ml-2">{{ latestUploadDate }}</span>
            </div>
            <div>
              <span class="text-gray-600">データ完全性:</span>
              <span class="font-medium ml-2">{{ dataCompleteness }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-center gap-2">
          <Download class="w-4 h-4 text-blue-600" />
          <p class="text-blue-700">
            エクスポートするデータがありません。まず写真をアップロードしてください。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Download, FileText, Database } from 'lucide-vue-next'
import { usePhotoStore } from '@/stores/photoStore'

const photoStore = usePhotoStore()

const latestUploadDate = computed(() => {
  if (photoStore.photos.length === 0) return '-'
  const latest = Math.max(...photoStore.photos.map(p => new Date(p.uploadDate).getTime()))
  return new Date(latest).toLocaleDateString('ja-JP')
})

const dataCompleteness = computed(() => {
  if (photoStore.photos.length === 0) return 0
  const photosWithData = photoStore.photos.filter(p => 
    Object.values(p.extractedData).some(v => v)
  ).length
  return Math.round((photosWithData / photoStore.photos.length) * 100)
})

const exportToCSV = () => {
  if (photoStore.photos.length === 0) return

  const headers = ['ファイル名', 'アップロード日時', ...photoStore.fields.map(f => f.name)]
  const csvContent = [
    headers.join(','),
    ...photoStore.photos.map(photo => [
      photo.filename,
      new Date(photo.uploadDate).toLocaleDateString('ja-JP'),
      ...photoStore.fields.map(field => photo.extractedData[field.name] || '')
    ].join(','))
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `photo_data_${new Date().getTime()}.csv`
  link.click()
}

const exportToJSON = () => {
  if (photoStore.photos.length === 0) return

  const jsonData = {
    exportDate: new Date().toISOString(),
    fields: photoStore.fields,
    photos: photoStore.photos.map(photo => ({
      filename: photo.filename,
      uploadDate: photo.uploadDate,
      extractedData: photo.extractedData,
    }))
  }

  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `photo_data_${new Date().getTime()}.json`
  link.click()
}
</script>