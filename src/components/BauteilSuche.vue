<template>
  <v-card elevation="2">
    <v-card-title class="bg-primary text-white d-flex align-center">
      <v-icon start>mdi-magnify</v-icon>
      <span class="flex-grow-1">Bauteil suchen</span>
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
      <!-- Search Input with Autocomplete -->
      <v-autocomplete
        v-model="searchFilter"
        :items="uniqueKdNummern"
        label="KD-Nummer filtern"
        placeholder="z.B. 12345A"
        variant="outlined"
        class="large-input mb-4"
        prepend-inner-icon="mdi-magnify"
        clearable
        hint="Tippen Sie eine KD-Nummer oder wählen Sie aus der Liste"
        persistent-hint
        no-data-text="Keine KD-Nummern vorhanden"
        auto-select-first
      ></v-autocomplete>

      <v-divider class="mb-4"></v-divider>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
        <div class="mt-4">Lade Lagerbestand...</div>
      </div>

      <!-- No Bauteile -->
      <v-alert v-else-if="allBauteile.length === 0" type="info" variant="tonal">
        <div class="text-h6">
          Keine Bauteile im Lager vorhanden.
        </div>
      </v-alert>

      <!-- Filtered Results Info -->
      <div v-else>
        <v-alert
          v-if="searchFilter && filteredBauteile.length === 0"
          type="warning"
          variant="tonal"
          class="mb-4"
        >
          <div class="text-h6">
            Keine Bauteile mit der KD-Nummer "{{ searchFilter }}" gefunden.
          </div>
        </v-alert>

        <v-alert
          v-else-if="searchFilter"
          type="success"
          variant="tonal"
          class="mb-4"
        >
          <div class="text-h6">
            {{ filteredBauteile.length }} Lagerplatz/plätze gefunden
          </div>
        </v-alert>

        <!-- Grouped by Location -->
        <div v-if="filteredBauteile.length > 0">
          <v-expansion-panels variant="accordion">
            <v-expansion-panel
              v-for="(group, index) in groupedBauteile"
              :key="index"
              class="mb-2"
            >
              <v-expansion-panel-title class="bg-blue-grey-lighten-5">
                <div class="d-flex align-center justify-space-between w-100 pr-4">
                  <div>
                    <v-icon class="mr-2">mdi-warehouse</v-icon>
                    <strong class="text-h6">
                      Reihe {{ group.reihe }}, Fach {{ group.fach }}, {{ group.position }}
                    </strong>
                  </div>
                  <v-chip color="primary" size="large">
                    {{ group.bauteile.length }} Bauteil(e)
                  </v-chip>
                </div>
              </v-expansion-panel-title>

              <v-expansion-panel-text>
                <v-table class="results-table">
                  <thead>
                    <tr>
                      <th class="text-left text-h6">KD-Nummer</th>
                      <th class="text-center text-h6">Anzahl</th>
                      <th class="text-center text-h6">Aktion</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="bauteil in group.bauteile" :key="bauteil.id">
                      <td class="text-h6">
                        <v-chip color="success" size="large">
                          {{ bauteil.kdNummer }}
                        </v-chip>
                      </td>
                      <td class="text-center text-h5 font-weight-bold">
                        {{ bauteil.anzahl }}
                      </td>
                      <td class="text-center">
                        <v-btn
                          color="warning"
                          size="large"
                          prepend-icon="mdi-package-down"
                          @click="openCheckoutDialog(bauteil)"
                        >
                          Checkout
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </div>
    </v-card-text>
  </v-card>

  <!-- Checkout Dialog -->
  <v-dialog v-model="checkoutDialog" max-width="500">
    <v-card>
      <v-card-title class="bg-warning text-white">
        <v-icon start>mdi-package-down</v-icon>
        Bauteil entnehmen
      </v-card-title>

      <v-card-text class="pa-6">
        <v-alert type="info" variant="tonal" class="mb-4">
          <div><strong>KD-Nummer:</strong> {{ selectedBauteil?.kdNummer }}</div>
          <div><strong>Lagerplatz:</strong> Reihe {{ selectedBauteil?.reihe }}, Fach {{ selectedBauteil?.fach }}, {{ selectedBauteil?.position }}</div>
          <div><strong>Verfügbar:</strong> {{ selectedBauteil?.anzahl }} Stück</div>
        </v-alert>

        <label class="text-h6 mb-3 d-block">Anzahl entnehmen</label>
        <v-row align="center" dense>
          <v-col cols="3">
            <v-btn
              size="large"
              color="error"
              icon
              @click="decreaseCheckoutAnzahl"
              :disabled="checkoutAnzahl <= 1"
            >
              <v-icon>mdi-minus</v-icon>
            </v-btn>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model.number="checkoutAnzahl"
              type="number"
              variant="outlined"
              class="large-input text-center"
              min="1"
              :max="selectedBauteil?.anzahl"
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-btn
              size="large"
              color="success"
              icon
              @click="increaseCheckoutAnzahl"
              :disabled="checkoutAnzahl >= selectedBauteil?.anzahl"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-col>
        </v-row>

        <v-btn
          block
          color="primary"
          class="mt-4"
          @click="setCheckoutToMax"
        >
          Alle entnehmen ({{ selectedBauteil?.anzahl }} Stück)
        </v-btn>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-btn
          variant="outlined"
          color="error"
          @click="checkoutDialog = false"
        >
          Abbrechen
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="success"
          @click="confirmCheckout"
          :loading="checkingOut"
        >
          Bestätigen
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Status Snackbar -->
  <v-snackbar
    v-model="snackbar"
    :color="snackbarColor"
    :timeout="3000"
  >
    {{ snackbarMessage }}
  </v-snackbar>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAllBauteile, updateBauteilAnzahl } from '../services/database'

const emit = defineEmits(['close'])

// State
const searchFilter = ref('')
const allBauteile = ref([])
const loading = ref(true)

// Checkout state
const checkoutDialog = ref(false)
const selectedBauteil = ref(null)
const checkoutAnzahl = ref(1)
const checkingOut = ref(false)

// Snackbar
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

// Computed: Get unique KD-Nummern for autocomplete
const uniqueKdNummern = computed(() => {
  const kdNummern = new Set()
  allBauteile.value.forEach(b => {
    kdNummern.add(b.kdNummer)
  })
  return Array.from(kdNummern).sort()
})

// Computed: Filter bauteile by KD-Nummer
const filteredBauteile = computed(() => {
  if (!searchFilter.value || !searchFilter.value.trim()) {
    return allBauteile.value
  }
  const filter = searchFilter.value.trim().toLowerCase()
  return allBauteile.value.filter(b =>
    b.kdNummer.toLowerCase().includes(filter)
  )
})

// Computed: Group bauteile by location
const groupedBauteile = computed(() => {
  const groups = {}

  filteredBauteile.value.forEach(bauteil => {
    const key = `${bauteil.reihe}-${bauteil.fach}-${bauteil.position}`
    if (!groups[key]) {
      groups[key] = {
        reihe: bauteil.reihe,
        fach: bauteil.fach,
        position: bauteil.position,
        bauteile: []
      }
    }
    groups[key].bauteile.push(bauteil)
  })

  // Convert to array and sort by location
  return Object.values(groups).sort((a, b) => {
    if (a.reihe !== b.reihe) return a.reihe - b.reihe
    if (a.fach !== b.fach) return a.fach - b.fach
    const posOrder = { links: 1, mitte: 2, rechts: 3 }
    return posOrder[a.position] - posOrder[b.position]
  })
})

// Load all bauteile on mount
async function loadAllBauteile() {
  try {
    loading.value = true
    allBauteile.value = await getAllBauteile()
  } catch (error) {
    console.error('Error loading bauteile:', error)
    showSnackbar('Fehler beim Laden der Bauteile: ' + error.message, 'error')
  } finally {
    loading.value = false
  }
}

function openCheckoutDialog(bauteil) {
  selectedBauteil.value = bauteil
  checkoutAnzahl.value = 1
  checkoutDialog.value = true
}

function increaseCheckoutAnzahl() {
  if (checkoutAnzahl.value < selectedBauteil.value.anzahl) {
    checkoutAnzahl.value++
  }
}

function decreaseCheckoutAnzahl() {
  if (checkoutAnzahl.value > 1) {
    checkoutAnzahl.value--
  }
}

function setCheckoutToMax() {
  checkoutAnzahl.value = selectedBauteil.value.anzahl
}

async function confirmCheckout() {
  if (!selectedBauteil.value) return

  try {
    checkingOut.value = true

    const neueAnzahl = selectedBauteil.value.anzahl - checkoutAnzahl.value

    await updateBauteilAnzahl(selectedBauteil.value.id, neueAnzahl)

    showSnackbar(
      `${checkoutAnzahl.value} Bauteil(e) erfolgreich entnommen`,
      'success'
    )

    checkoutDialog.value = false

    // Reload all bauteile
    await loadAllBauteile()
  } catch (error) {
    console.error('Checkout error:', error)
    showSnackbar('Fehler beim Checkout: ' + error.message, 'error')
  } finally {
    checkingOut.value = false
  }
}

function showSnackbar(message, color = 'success') {
  snackbarMessage.value = message
  snackbarColor.value = color
  snackbar.value = true
}

// Load bauteile on mount
onMounted(() => {
  loadAllBauteile()
})
</script>

<style scoped>
.large-input :deep(.v-field__input) {
  font-size: 1.3rem;
  padding: 16px;
}

.large-input :deep(.v-autocomplete__content) {
  font-size: 1.2rem;
}

.large-input :deep(.v-list-item-title) {
  font-size: 1.2rem;
}

.results-table {
  font-size: 1.1rem;
}

.results-table th {
  padding: 16px !important;
  background-color: #f5f5f5;
}

.results-table td {
  padding: 16px !important;
}

/* Mobile Responsiveness */
@media (max-width: 600px) {
  /* Kleinere Schriftgrößen im Suchfeld */
  .large-input :deep(.v-field__input) {
    font-size: 1.1rem;
    padding: 12px;
  }
  
  .large-input :deep(.v-autocomplete__content) {
    font-size: 1rem;
  }
  
  .large-input :deep(.v-list-item-title) {
    font-size: 1rem;
  }
  
  /* Tabelle responsiver machen */
  .results-table {
    font-size: 0.9rem;
  }
  
  .results-table th {
    padding: 8px !important;
    font-size: 0.9rem !important;
  }
  
  .results-table td {
    padding: 8px !important;
  }
  
  /* Kleinere Chips in der Tabelle */
  .results-table :deep(.v-chip) {
    font-size: 0.85rem !important;
    height: auto !important;
    padding: 4px 8px !important;
  }
  
  /* Checkout-Button kompakter */
  .results-table :deep(.v-btn) {
    font-size: 0.85rem !important;
    padding: 8px 12px !important;
    min-width: auto !important;
  }
  
  /* Expansion Panel Titel responsiver */
  :deep(.v-expansion-panel-title) {
    font-size: 0.95rem !important;
    padding: 12px !important;
  }
  
  :deep(.v-expansion-panel-title .text-h6) {
    font-size: 1rem !important;
  }
  
  /* Kleinere Alert-Texte */
  :deep(.v-alert .text-h6) {
    font-size: 1rem !important;
  }
  
  /* Card-Padding reduzieren */
  :deep(.v-card-text.pa-6) {
    padding: 16px !important;
  }
  
  /* Anzahl-Spalte in der Tabelle */
  .results-table :deep(.text-h5) {
    font-size: 1.2rem !important;
  }
  
  /* Chip-Größe im Panel-Header */
  :deep(.v-expansion-panel-title .v-chip) {
    font-size: 0.8rem !important;
  }
}

/* Sehr kleine Bildschirme (< 400px) */
@media (max-width: 400px) {
  /* Tabelle noch kompakter */
  .results-table th,
  .results-table td {
    padding: 6px !important;
    font-size: 0.8rem !important;
  }
  
  /* Button-Text auf sehr kleinen Bildschirmen verkürzen */
  .results-table :deep(.v-btn .v-btn__content) {
    font-size: 0.75rem !important;
  }
}
</style>
