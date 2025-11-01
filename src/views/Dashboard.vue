<template>
  <v-container fluid class="pa-4">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <!-- Header -->
        <v-card elevation="3" class="mb-6">
          <v-card-title class="text-h4 bg-primary text-white pa-6 text-center">
            <v-icon size="x-large" class="mr-3">mdi-warehouse</v-icon>
            Hoffi-Store
          </v-card-title>
        </v-card>

        <!-- Statistics Card -->
        <v-card elevation="2" class="mb-6">
          <v-card-title class="text-h5 bg-blue-grey-lighten-4">
            <v-icon class="mr-2">mdi-chart-box</v-icon>
            Lagerbestand
          </v-card-title>
          <v-card-text class="pa-6">
            <v-row>
              <v-col cols="6" class="text-center">
                <div class="text-h3 text-primary font-weight-bold">
                  {{ totalBauteile }}
                </div>
                <div class="text-h6 text-grey-darken-1 mt-2">
                  Bauteile gesamt
                </div>
              </v-col>
              <v-col cols="6" class="text-center">
                <div class="text-h3 text-secondary font-weight-bold">
                  {{ uniqueEntries }}
                </div>
                <div class="text-h6 text-grey-darken-1 mt-2">
                  Lagerplätze belegt
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Action Buttons -->
        <v-row dense>
          <v-col cols="12">
            <v-btn
              block
              size="x-large"
              color="success"
              class="action-button mb-4"
              prepend-icon="mdi-barcode-scan"
              @click="goToErfassen"
            >
              <span class="text-h5">Bauteil erfassen</span>
            </v-btn>
          </v-col>

          <v-col cols="12">
            <v-btn
              block
              size="x-large"
              color="primary"
              class="action-button mb-4"
              prepend-icon="mdi-magnify"
              @click="goToSuchen"
            >
              <span class="text-h5">Bauteil suchen</span>
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getBauteileCount, getUniqueEntriesCount } from '../services/database'

const router = useRouter()
const totalBauteile = ref(0)
const uniqueEntries = ref(0)

async function loadStatistics() {
  try {
    totalBauteile.value = await getBauteileCount()
    uniqueEntries.value = await getUniqueEntriesCount()
  } catch (error) {
    console.error('Error loading statistics:', error)
  }
}

function goToErfassen() {
  router.push('/erfassen')
}

function goToSuchen() {
  router.push('/suchen')
}

onMounted(() => {
  loadStatistics()
})
</script>

<style scoped>
.action-button {
  min-height: 100px !important;
  font-size: 1.3rem !important;
}

.action-button .v-btn__content {
  font-size: 1.3rem;
}
</style>
