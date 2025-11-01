<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>

    <!-- PWA Install Prompt -->
    <PwaInstallPrompt />
  </v-app>
</template>

<script setup>
import PwaInstallPrompt from './components/PwaInstallPrompt.vue'
</script>

<style>
html, body {
  overflow-x: hidden;
}
</style>
