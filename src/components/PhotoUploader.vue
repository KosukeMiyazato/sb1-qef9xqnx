<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <div class="flex items-center gap-2 mb-6">
        <Camera class="w-5 h-5 text-primary-600" />
        <h2 class="text-xl font-semibold">写真をアップロード</h2>
      </div>

      <!-- File Upload Area -->
      <div
        :class="[
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
          selectedFile ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'
        ]"
        @drop="handleDrop"
        @dragover="handleDragOver"
        @click="triggerFileInput"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="handleFileSelect"
          class="hidden"
        />

        <div v-if="selectedFile" class="space-y-4">
          <div class="w-32 h-32 mx-auto relative rounded-lg overflow-hidden">
            <img
              :src="previewUrl"
              alt="Preview"
              class="w-full h-full object-cover"
            />
          </div>
          <p class="text-sm text-gray-600">{{ selectedFile.name }}</p>
        </div>

        <div v-else class="space-y-4">
          <FileImage class="w-12 h-12 mx-auto text-gray-400" />
          <div>
            <p class="text-lg font-medium text-gray-900">
              ここに画像をドラッグ&ドロップ
            </p>
            <p class="text-sm text-gray-500">または下のボタンから選択</p>
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div v-if="isProcessing" class="space-y-2 mt-6">
        <div class="flex justify-between text-sm">
          <span>{{ isAnalyzing ? '画像を解析中...' : 'アップロード中...' }}</span>
          <span>{{ progress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-primary-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center gap-2">
          <AlertCircle class="w-4 h-4 text-red-600" />
          <p class="text-red-700">{{ error }}</p>
        </div>
      </div>

      <!-- Success Alert -->
      <div v-if="success" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex items-center gap-2">
          <Check class="w-4 h-4 text-green-600" />
          <p class="text-green-700">
            写真の解析が完了しました！ギャラリータブで確認できます。
          </p>
        </div>
      </div>

      <!-- Process Button -->
      <div class="flex justify-center mt-6">
        <button
          @click="processImage"
          :disabled="!selectedFile || photoStore.fields.length === 0 || isProcessing"
          :class="[
            'min-w-32 px-6 py-2 rounded-lg font-medium transition-all',
            selectedFile && photoStore.fields.length > 0 && !isProcessing
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          ]"
        >
          <Loader2 v-if="isAnalyzing" class="w-4 h-4 mr-2 animate-spin inline" />
          <Upload v-else class="w-4 h-4 mr-2 inline" />
          {{ isAnalyzing ? '解析中...' : '解析開始' }}
        </button>
      </div>

      <div v-if="photoStore.fields.length === 0" class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-center gap-2">
          <AlertCircle class="w-4 h-4 text-blue-600" />
          <p class="text-blue-700">
            まず「フィールド設定」タブで抽出したい項目を設定してください。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Camera, FileImage, Upload, Loader2, Check, AlertCircle } from 'lucide-vue-next'
import { usePhotoStore } from '@/stores/photoStore'
import { analyzeImage } from '@/lib/vision-api'

const photoStore = usePhotoStore()

const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string>('')
const isProcessing = ref(false)
const isAnalyzing = ref(false)
const progress = ref(0)
const error = ref<string | null>(null)
const success = ref(false)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file && file.type.startsWith('image/')) {
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
    error.value = null
    success.value = false
  } else {
    error.value = '画像ファイルを選択してください'
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  const file = event.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
    error.value = null
    success.value = false
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const processImage = async () => {
  if (!selectedFile.value || photoStore.fields.length === 0) {
    error.value = 'ファイルとフィールド設定が必要です'
    return
  }

  isProcessing.value = true
  isAnalyzing.value = true
  progress.value = 20
  error.value = null

  try {
    // Convert file to base64
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(',')[1])
      }
      reader.readAsDataURL(selectedFile.value!)
    })

    progress.value = 40

    // Analyze image with Google Vision API
    const extractedText = await analyzeImage(base64)
    
    progress.value = 70

    // Extract field information from text
    const extractedData: Record<string, string> = {}
    photoStore.fields.forEach(field => {
      const pattern = new RegExp(`${field.name}[：:]?\\s*([^\\n\\r]+)`, 'i')
      const match = extractedText.match(pattern)
      extractedData[field.name] = match?.[1]?.trim() || ''
    })

    // Create photo record
    const photoData = {
      id: Date.now().toString(),
      filename: selectedFile.value.name,
      uploadDate: new Date().toISOString(),
      imageUrl: URL.createObjectURL(selectedFile.value),
      extractedData,
      rawText: extractedText,
    }

    photoStore.addPhoto(photoData)

    progress.value = 100
    isAnalyzing.value = false
    success.value = true

    // Reset after success
    setTimeout(() => {
      selectedFile.value = null
      previewUrl.value = ''
      isProcessing.value = false
      progress.value = 0
      success.value = false
    }, 2000)

  } catch (err) {
    isProcessing.value = false
    isAnalyzing.value = false
    error.value = err instanceof Error ? err.message : '画像の解析に失敗しました'
  }
}
</script>