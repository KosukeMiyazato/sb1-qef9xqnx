<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Smart Photo Info Extractor
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          写真をアップロードして、画像認識技術で自動的に情報を抽出・整理します
        </p>
        <div class="flex justify-center gap-2 mt-4">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
            <Camera class="w-4 h-4 mr-1" />
            Google Vision API
          </span>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm border border-gray-300 text-gray-700">
            カスタムフィールド対応
          </span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="w-full">
        <div class="flex justify-center mb-8">
          <div class="grid grid-cols-4 bg-white rounded-lg p-1 shadow-sm border">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              ]"
            >
              <component :is="tab.icon" class="w-4 h-4" />
              {{ tab.label }}
            </button>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="space-y-6">
          <PhotoUploader v-if="activeTab === 'upload'" />
          <FieldConfigSection v-if="activeTab === 'settings'" />
          <PhotoGallery v-if="activeTab === 'gallery'" />
          <ExportSection v-if="activeTab === 'export'" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Camera, Settings, Image, Download } from 'lucide-vue-next'
import PhotoUploader from './components/PhotoUploader.vue'
import FieldConfigSection from './components/FieldConfigSection.vue'
import PhotoGallery from './components/PhotoGallery.vue'
import ExportSection from './components/ExportSection.vue'

const activeTab = ref('upload')

const tabs = [
  { id: 'upload', label: 'アップロード', icon: Camera },
  { id: 'settings', label: 'フィールド設定', icon: Settings },
  { id: 'gallery', label: 'ギャラリー', icon: Image },
  { id: 'export', label: 'エクスポート', icon: Download },
]
</script>