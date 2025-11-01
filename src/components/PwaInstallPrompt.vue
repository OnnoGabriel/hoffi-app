<template>
  <v-snackbar
    v-model="showPrompt"
    :timeout="-1"
    location="bottom"
    multi-line
  >
    <div class="d-flex align-center">
      <v-icon class="mr-3" color="primary">mdi-download</v-icon>
      <div class="flex-grow-1">
        <div class="font-weight-bold">App installieren</div>
        <div class="text-caption">Installieren Sie Hoffi-Store für schnelleren Zugriff</div>
      </div>
    </div>

    <template v-slot:actions>
      <v-btn
        color="primary"
        variant="text"
        @click="install"
      >
        Installieren
      </v-btn>
      <v-btn
        variant="text"
        @click="dismiss"
      >
        Später
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showPrompt = ref(false)
let deferredPrompt = null

onMounted(() => {
  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault()
    // Save the event for later use
    deferredPrompt = e

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (!dismissed) {
      // Show the install prompt after a short delay
      setTimeout(() => {
        showPrompt.value = true
      }, 3000)
    }
  })

  // Listen for successful installation
  window.addEventListener('appinstalled', () => {
    showPrompt.value = false
    deferredPrompt = null
  })
})

async function install() {
  if (!deferredPrompt) {
    return
  }

  // Show the install prompt
  deferredPrompt.prompt()

  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice

  // Clear the deferredPrompt
  deferredPrompt = null
  showPrompt.value = false

  if (outcome === 'accepted') {
    console.log('User accepted the install prompt')
  } else {
    console.log('User dismissed the install prompt')
  }
}

function dismiss() {
  showPrompt.value = false
  // Remember that user dismissed the prompt
  localStorage.setItem('pwa-install-dismissed', 'true')
}
</script>
