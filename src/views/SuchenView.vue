<template>
  <v-container fluid class="pa-4">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <!-- Back Button -->
        <v-btn
          color="primary"
          variant="outlined"
          prepend-icon="mdi-arrow-left"
          class="mb-4"
          @click="goBack"
        >
          Zurück zum Dashboard
        </v-btn>

        <!-- Search Component -->
        <BauteilSuche />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useRouter } from 'vue-router'
import BauteilSuche from '../components/BauteilSuche.vue'

const router = useRouter()

function goBack() {
  router.push('/')
}
</script>
