<template>
  <v-card elevation="2">
    <v-card-title class="bg-success text-white d-flex align-center">
      <v-icon start>mdi-package-variant</v-icon>
      <span class="flex-grow-1">Lagerplatz zuweisen</span>
      <v-btn
        icon
        variant="text"
        @click="$emit('close')"
        size="small"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text class="pa-6">
      <!-- KD-Nummer Display -->
      <v-alert type="info" class="mb-6" variant="tonal">
        <div class="text-h6">
          <v-icon class="mr-2">mdi-barcode</v-icon>
          KD-Nummer: <strong>{{ kdNummer }}</strong>
        </div>
      </v-alert>

      <!-- Anzahl Input -->
      <div class="mb-6">
        <label class="text-h6 mb-3 d-block">Anzahl der Bauteile</label>
        <v-row align="center" dense>
          <v-col cols="3">
            <v-btn
              size="x-large"
              color="error"
              icon
              @click="decreaseAnzahl"
              :disabled="anzahl <= 1"
            >
              <v-icon size="x-large">mdi-minus</v-icon>
            </v-btn>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model.number="anzahl"
              type="number"
              variant="outlined"
              class="large-input text-center"
              min="1"
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-btn
              size="x-large"
              color="success"
              icon
              @click="increaseAnzahl"
            >
              <v-icon size="x-large">mdi-plus</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </div>

      <!-- Reihe Selection -->
      <div class="mb-6">
        <label class="text-h6 mb-3 d-block">Reihe (1-6)</label>
        <v-select
          v-model="reihe"
          :items="[1, 2, 3, 4, 5, 6]"
          variant="outlined"
          class="large-input"
          hide-details
        ></v-select>
      </div>

      <!-- Fach Selection -->
      <div class="mb-6">
        <label class="text-h6 mb-3 d-block">Fach (1-5)</label>
        <v-select
          v-model="fach"
          :items="[1, 2, 3, 4, 5]"
          variant="outlined"
          class="large-input"
          hide-details
        ></v-select>
      </div>

      <!-- Position Selection -->
      <div class="mb-6">
        <label class="text-h6 mb-3 d-block">Position</label>
        <v-btn-toggle
          v-model="position"
          color="primary"
          mandatory
          divided
          class="w-100"
        >
          <v-btn value="links" size="x-large" class="flex-grow-1">
            <v-icon class="mr-2">mdi-arrow-left-bold</v-icon>
            Links
          </v-btn>
          <v-btn value="mitte" size="x-large" class="flex-grow-1">
            <v-icon class="mr-2">mdi-circle</v-icon>
            Mitte
          </v-btn>
          <v-btn value="rechts" size="x-large" class="flex-grow-1">
            <v-icon class="mr-2">mdi-arrow-right-bold</v-icon>
            Rechts
          </v-btn>
        </v-btn-toggle>
      </div>

      <!-- Action Buttons -->
      <v-row dense class="mt-6">
        <v-col cols="12" sm="6">
          <v-btn
            block
            size="x-large"
            color="error"
            variant="outlined"
            prepend-icon="mdi-cancel"
            @click="cancel"
          >
            Abbrechen
          </v-btn>
        </v-col>
        <v-col cols="12" sm="6">
          <v-btn
            block
            size="x-large"
            color="success"
            prepend-icon="mdi-content-save"
            @click="save"
            :disabled="!isValid"
            :loading="saving"
          >
            Speichern
          </v-btn>
        </v-col>
      </v-row>

      <!-- Success/Error Messages -->
      <v-alert
        v-if="statusMessage"
        :type="statusType"
        class="mt-4"
        closable
        @click:close="statusMessage = ''"
      >
        {{ statusMessage }}
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { addBauteil } from '../services/database'

const props = defineProps({
  kdNummer: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['saved', 'cancel', 'close'])

// Form state
const anzahl = ref(1)
const reihe = ref(1)
const fach = ref(1)
const position = ref('links')
const saving = ref(false)
const statusMessage = ref('')
const statusType = ref('info')

// Validation
const isValid = computed(() => {
  return anzahl.value > 0 && reihe.value && fach.value && position.value
})

function increaseAnzahl() {
  anzahl.value++
}

function decreaseAnzahl() {
  if (anzahl.value > 1) {
    anzahl.value--
  }
}

async function save() {
  if (!isValid.value) {
    showStatus('Bitte alle Felder ausfüllen', 'error')
    return
  }

  try {
    saving.value = true

    const bauteil = {
      kdNummer: props.kdNummer,
      anzahl: anzahl.value,
      reihe: reihe.value,
      fach: fach.value,
      position: position.value
    }

    await addBauteil(bauteil)

    showStatus('Bauteil erfolgreich gespeichert!', 'success')

    // Emit saved event after short delay
    setTimeout(() => {
      emit('saved', bauteil)
    }, 1000)
  } catch (error) {
    console.error('Error saving bauteil:', error)
    showStatus('Fehler beim Speichern: ' + error.message, 'error')
  } finally {
    saving.value = false
  }
}

function cancel() {
  emit('cancel')
}

function showStatus(message, type = 'info') {
  statusMessage.value = message
  statusType.value = type

  if (type === 'success' || type === 'info') {
    setTimeout(() => {
      statusMessage.value = ''
    }, 3000)
  }
}
</script>

<style scoped>
.large-input :deep(.v-field__input) {
  font-size: 1.5rem;
  text-align: center;
  padding: 16px;
}

.large-input :deep(.v-select__selection) {
  font-size: 1.5rem;
  font-weight: bold;
}

.w-100 {
  width: 100%;
}

/* Mobile Responsiveness */
@media (max-width: 600px) {
  /* Kleinere Schriftgrößen für Eingabefelder */
  .large-input :deep(.v-field__input) {
    font-size: 1.2rem;
    padding: 12px;
  }
  
  .large-input :deep(.v-select__selection) {
    font-size: 1.2rem;
  }
  
  /* Labels kleiner auf mobil */
  :deep(.text-h6) {
    font-size: 1.05rem !important;
  }
  
  /* Plus/Minus Buttons kompakter */
  :deep(.v-btn[icon]) {
    width: 48px !important;
    height: 48px !important;
  }
  
  :deep(.v-btn[icon] .v-icon) {
    font-size: 1.5rem !important;
  }
  
  /* Position-Toggle-Buttons responsiver */
  :deep(.v-btn-toggle .v-btn) {
    font-size: 0.9rem !important;
    padding: 8px 12px !important;
  }
  
  :deep(.v-btn-toggle .v-btn .v-icon) {
    font-size: 1rem !important;
    margin-right: 4px !important;
  }
  
  /* Card-Padding reduzieren */
  :deep(.v-card-text.pa-6) {
    padding: 16px !important;
  }
  
  /* Alert Info-Box */
  :deep(.v-alert .text-h6) {
    font-size: 1rem !important;
  }
  
  /* Action Buttons */
  :deep(.v-btn[size="x-large"]) {
    height: 48px !important;
    font-size: 1rem !important;
  }
}

/* Sehr kleine Bildschirme (< 400px) */
@media (max-width: 400px) {
  /* Noch kleinere Schriften */
  .large-input :deep(.v-field__input) {
    font-size: 1.1rem;
    padding: 10px;
  }
  
  .large-input :deep(.v-select__selection) {
    font-size: 1.1rem;
  }
  
  /* Position-Buttons ohne Text-Umbruch */
  :deep(.v-btn-toggle .v-btn) {
    font-size: 0.8rem !important;
    padding: 6px 8px !important;
  }
  
  /* Buttons noch kompakter */
  :deep(.v-btn[size="x-large"]) {
    height: 44px !important;
    font-size: 0.9rem !important;
  }
}
</style>
