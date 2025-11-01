<template>
  <v-container fluid class="pa-4">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <!-- Search Component -->
        <BauteilSuche @close="goBack" />
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
