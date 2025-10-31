<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <OCRCamera />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import OCRCamera from './components/OCRCamera.vue'
</script>

<style>
html, body {
  overflow-x: hidden;
}
</style>
