<template>
  <v-container fluid class="pa-4">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <!-- Step 1: OCR Camera -->
        <div v-if="currentStep === 'ocr'">
          <OCRCamera 
            @kdNummerSelected="handleKdNummerSelected"
            @close="goToDashboard"
          />
        </div>

        <!-- Step 2: Lagerplatz Selection -->
        <div v-if="currentStep === 'lagerplatz'">
          <LagerplatzAuswahl
            :kdNummer="selectedKdNummer"
            @saved="handleSaved"
            @cancel="handleCancel"
            @close="goBack"
          />
        </div>
      </v-col>
    </v-row>
  </v-container>

  <!-- Success Dialog -->
  <v-dialog v-model="successDialog" max-width="500">
    <v-card>
      <v-card-title class="bg-success text-white">
        <v-icon start>mdi-check-circle</v-icon>
        Erfolgreich gespeichert!
      </v-card-title>

      <v-card-text class="pa-6 text-center">
        <v-icon size="80" color="success" class="mb-4">mdi-package-variant-closed</v-icon>
        <div class="text-h6 mb-2">
          Bauteil wurde erfolgreich im Lager erfasst
        </div>
        <div class="text-body-1">
          <strong>KD-Nummer:</strong> {{ selectedKdNummer }}
        </div>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-btn
          block
          size="large"
          color="primary"
          prepend-icon="mdi-plus"
          @click="addAnother"
        >
          Weiteres Bauteil erfassen
        </v-btn>
      </v-card-actions>
      <v-card-actions class="pa-4 pt-0">
        <v-btn
          block
          size="large"
          color="success"
          variant="outlined"
          prepend-icon="mdi-home"
          @click="goToDashboard"
        >
          Zurück zum Dashboard
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import OCRCamera from '../components/OCRCamera.vue'
import LagerplatzAuswahl from '../components/LagerplatzAuswahl.vue'

const router = useRouter()

const currentStep = ref('ocr')
const selectedKdNummer = ref('')
const successDialog = ref(false)

function handleKdNummerSelected(kdNummer) {
  selectedKdNummer.value = kdNummer
  currentStep.value = 'lagerplatz'
}

function handleSaved() {
  successDialog.value = true
}

function handleCancel() {
  currentStep.value = 'ocr'
  selectedKdNummer.value = ''
}

function addAnother() {
  successDialog.value = false
  currentStep.value = 'ocr'
  selectedKdNummer.value = ''
}

function goToDashboard() {
  router.push('/')
}

function goBack() {
  if (currentStep.value === 'lagerplatz') {
    currentStep.value = 'ocr'
  } else {
    router.push('/')
  }
}
</script>
