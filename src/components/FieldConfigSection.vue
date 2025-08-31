<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <div class="flex items-center gap-2 mb-6">
        <Settings class="w-5 h-5 text-primary-600" />
        <h2 class="text-xl font-semibold">抽出フィールド設定</h2>
      </div>

      <!-- Preset Templates -->
      <div class="mb-8">
        <h3 class="text-base font-medium mb-3">テンプレート</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="template in templates"
            :key="template.name"
            class="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
            @click="applyTemplate(template.fields)"
          >
            <div class="flex items-center gap-3 mb-3">
              <component :is="template.icon" class="w-5 h-5 text-blue-600" />
              <h4 class="font-medium">{{ template.name }}</h4>
            </div>
            <div class="flex flex-wrap gap-1 mb-3">
              <span
                v-for="field in template.fields.slice(0, 4)"
                :key="field"
                class="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800"
              >
                {{ field }}
              </span>
              <span
                v-if="template.fields.length > 4"
                class="inline-flex items-center px-2 py-1 rounded text-xs border border-gray-300 text-gray-700"
              >
                +{{ template.fields.length - 4 }}項目
              </span>
            </div>
            <button class="w-full px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
              このテンプレートを使用
            </button>
          </div>
        </div>
      </div>

      <div class="border-t pt-6">
        <h3 class="text-base font-medium mb-3">カスタムフィールド</h3>
        
        <!-- Add New Field -->
        <div class="flex gap-2 mb-4">
          <input
            v-model="newFieldName"
            @keyup.enter="addField"
            placeholder="新しいフィールド名を入力"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            @click="addField"
            :disabled="!newFieldName.trim()"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2',
              newFieldName.trim()
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            ]"
          >
            <Plus class="w-4 h-4" />
            追加
          </button>
        </div>

        <!-- Current Fields -->
        <div v-if="photoStore.fields.length > 0" class="space-y-3">
          <h4 class="text-sm font-medium">設定済みフィールド</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            <div
              v-for="field in photoStore.fields"
              :key="field.id"
              class="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
            >
              <span class="text-sm font-medium">{{ field.name }}</span>
              <button
                @click="removeField(field.id)"
                class="h-6 w-6 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
              >
                <X class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        <div v-else class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex items-center gap-2">
            <Info class="w-4 h-4 text-blue-600" />
            <p class="text-blue-700">
              抽出したい情報のフィールドを設定してください。例：ワイン名、生産者、品種など
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, X, Settings, Wine, Info } from 'lucide-vue-next'
import { usePhotoStore } from '@/stores/photoStore'

const photoStore = usePhotoStore()
const newFieldName = ref('')

const templates = [
  {
    name: 'ワイン情報',
    icon: Wine,
    fields: ['ワイン名', '生産者', '品種', 'AOC', '産地', 'ヴィンテージ', '価格']
  },
  {
    name: '商品情報',
    icon: Info,
    fields: ['商品名', 'ブランド', 'モデル', '価格', '製造年', '色', 'サイズ']
  }
]

const addField = () => {
  if (newFieldName.value.trim() && !photoStore.fields.find(f => f.name === newFieldName.value.trim())) {
    const newField = {
      id: Date.now().toString(),
      name: newFieldName.value.trim(),
      type: 'text' as const,
    }
    photoStore.setFields([...photoStore.fields, newField])
    newFieldName.value = ''
  }
}

const removeField = (id: string) => {
  photoStore.setFields(photoStore.fields.filter(f => f.id !== id))
}

const applyTemplate = (templateFields: string[]) => {
  const newFields = templateFields.map((fieldName, index) => ({
    id: `${Date.now()}_${index}`,
    name: fieldName,
    type: 'text' as const,
  }))
  photoStore.setFields(newFields)
}
</script>