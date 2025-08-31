import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export interface Field {
  id: string
  name: string
  type: 'text'
}

export interface Photo {
  id: string
  filename: string
  uploadDate: string
  imageUrl: string
  extractedData: Record<string, string>
  rawText: string
}

export const usePhotoStore = defineStore('photo', () => {
  const fields = ref<Field[]>([])
  const photos = ref<Photo[]>([])

  // Load data from localStorage
  const loadFromStorage = () => {
    try {
      const savedFields = localStorage.getItem('photo-extractor-fields')
      const savedPhotos = localStorage.getItem('photo-extractor-photos')

      if (savedFields) {
        fields.value = JSON.parse(savedFields)
      }

      if (savedPhotos) {
        photos.value = JSON.parse(savedPhotos)
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error)
    }
  }

  // Save to localStorage when data changes
  watch(fields, (newFields) => {
    localStorage.setItem('photo-extractor-fields', JSON.stringify(newFields))
  }, { deep: true })

  watch(photos, (newPhotos) => {
    localStorage.setItem('photo-extractor-photos', JSON.stringify(newPhotos))
  }, { deep: true })

  const addPhoto = (photo: Photo) => {
    photos.value.unshift(photo)
  }

  const updatePhoto = (id: string, updates: Partial<Photo>) => {
    const index = photos.value.findIndex(p => p.id === id)
    if (index !== -1) {
      photos.value[index] = { ...photos.value[index], ...updates }
    }
  }

  const deletePhoto = (id: string) => {
    photos.value = photos.value.filter(p => p.id !== id)
  }

  const setFields = (newFields: Field[]) => {
    fields.value = newFields
  }

  // Initialize store
  loadFromStorage()

  return {
    fields,
    photos,
    addPhoto,
    updatePhoto,
    deletePhoto,
    setFields,
  }
})