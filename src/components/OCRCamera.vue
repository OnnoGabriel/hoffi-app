<template>
  <v-card elevation="2">
    <v-card-title class="bg-primary text-white">
      <v-icon start>mdi-camera-iris</v-icon>
      Kamera → Texterkennung (Demo)
    </v-card-title>

    <v-card-text class="pa-4">
      <!-- Video Element -->
      <div class="video-container mb-4">
        <video
          ref="videoRef"
          autoplay
          playsinline
          class="video-element"
        ></video>
      </div>

      <!-- Control Buttons -->
      <v-row dense class="mb-4">
        <v-col cols="12" sm="6" md="3">
          <v-btn
            block
            color="success"
            :disabled="cameraActive"
            @click="startCamera"
            prepend-icon="mdi-camera"
          >
            Start Kamera
          </v-btn>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-btn
            block
            color="error"
            :disabled="!cameraActive"
            @click="stopCamera"
            prepend-icon="mdi-stop"
          >
            Stop
          </v-btn>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-btn
            block
            color="primary"
            :disabled="!cameraActive"
            :loading="ocrProcessing"
            @click="doOCR"
            prepend-icon="mdi-camera-burst"
          >
            Photo Texterkennung
          </v-btn>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-btn
            block
            color="warning"
            :disabled="!cameraActive"
            @click="toggleTorch"
            prepend-icon="mdi-flashlight"
          >
            Blitzlicht an/aus
          </v-btn>
        </v-col>
      </v-row>

      <!-- Live OCR Toggle -->
      <v-row dense class="mb-4">
        <v-col cols="12">
          <v-switch
            v-model="liveOcrEnabled"
            color="primary"
            label="Video Texterkennung (alle 1.5s)"
            :disabled="!cameraActive"
            hide-details
          ></v-switch>
        </v-col>
      </v-row>

      <!-- OCR Result Text Area -->
      <v-textarea
        v-model="recognizedText"
        label="Erkannter Text"
        placeholder="Erkannter Text erscheint hier..."
        rows="8"
        readonly
        variant="outlined"
        class="mb-4"
      ></v-textarea>

      <!-- Order Number Display -->
      <v-text-field
        v-model="orderNumber"
        label="Zuletzt erkannte Nummer"
        readonly
        variant="outlined"
        prepend-icon="mdi-barcode"
      ></v-text-field>

      <!-- Status Messages -->
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
import { ref, watch, onBeforeUnmount } from 'vue'
import { createWorker } from 'tesseract.js'

// Refs
const videoRef = ref(null)
const cameraActive = ref(false)
const ocrProcessing = ref(false)
const liveOcrEnabled = ref(false)
const recognizedText = ref('')
const orderNumber = ref('')
const statusMessage = ref('')
const statusType = ref('info')

// Internal state
let stream = null
let track = null
let liveInterval = null
let usingTextDetector = false
let textDetector = null
let tesseractWorker = null
let tesseractLoaded = false

// Canvas for capturing frames
const offCanvas = document.createElement('canvas')
const offCtx = offCanvas.getContext('2d')

// Start Camera
async function startCamera() {
  try {
    // Try with exact environment facing mode first
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: 'environment' },
          width: { ideal: 1280 }
        },
        audio: false
      })
    } catch (err) {
      // Fallback without exact constraint
      stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', 
          width: { ideal: 1280 } 
        },
        audio: false
      })
    }

    if (videoRef.value) {
      videoRef.value.srcObject = stream
      track = stream.getVideoTracks()[0]
      cameraActive.value = true

      // Check for TextDetector API support
      if ('TextDetector' in window) {
        try {
          textDetector = new TextDetector()
          usingTextDetector = true
          console.log('TextDetector available - using native API')
          showStatus('Native TextDetector API aktiv', 'success')
        } catch (e) {
          usingTextDetector = false
          showStatus('Using Tesseract.js for OCR', 'info')
        }
      } else {
        usingTextDetector = false
        showStatus('Using Tesseract.js for OCR', 'info')
      }
    }
  } catch (error) {
    console.error('Camera error:', error)
    showStatus('Kamera-Zugriff fehlgeschlagen: ' + error.message, 'error')
  }
}

// Stop Camera
function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop())
    stream = null
    track = null
  }
  cameraActive.value = false
  liveOcrEnabled.value = false
  if (videoRef.value) {
    videoRef.value.srcObject = null
  }
}

// Capture Frame from Video
function captureFrame() {
  const video = videoRef.value
  if (!video || !video.videoWidth || !video.videoHeight) {
    return null
  }

  const vw = video.videoWidth
  const vh = video.videoHeight
  const maxW = 1024

  let w = vw
  let h = vh
  if (w > maxW) {
    const ratio = maxW / w
    w = maxW
    h = Math.round(vh * ratio)
  }

  offCanvas.width = w
  offCanvas.height = h
  offCtx.drawImage(video, 0, 0, w, h)
  return offCanvas
}

// Run Native TextDetector
async function runTextDetector(canvas) {
  if (!textDetector) return null
  try {
    const bitmap = await createImageBitmap(canvas)
    const results = await textDetector.detect(bitmap)
    if (!results || results.length === 0) return null
    
    return results.map(r => r.rawValue).join('\n')
  } catch (e) {
    console.warn('TextDetector failed:', e)
    return null
  }
}

// Ensure Tesseract is loaded
async function ensureTesseract() {
  if (tesseractLoaded) return

  try {
    tesseractWorker = await createWorker('deu', 1, {
      logger: m => {
        if (m.status === 'loading tesseract core' || m.status === 'initializing tesseract') {
          showStatus(`Tesseract wird geladen... ${Math.round(m.progress * 100)}%`, 'info')
        }
      }
    })
    tesseractLoaded = true
    showStatus('Tesseract bereit', 'success')
  } catch (error) {
    console.error('Tesseract initialization error:', error)
    showStatus('Tesseract-Initialisierung fehlgeschlagen', 'error')
    throw error
  }
}

// Run Tesseract OCR
async function runTesseract(canvas) {
  await ensureTesseract()
  const dataUrl = canvas.toDataURL('image/png')
  const { data: { text } } = await tesseractWorker.recognize(dataUrl)
  return text
}

// Perform OCR
async function doOCR() {
  if (!videoRef.value || !track) return

  try {
    ocrProcessing.value = true
    const canvas = captureFrame()
    if (!canvas) {
      showStatus('Fehler beim Erfassen des Frames', 'error')
      return
    }

    // Try native TextDetector first
    if (usingTextDetector && textDetector) {
      const text = await runTextDetector(canvas)
      if (text) {
        analyzeText(text)
        ocrProcessing.value = false
        return
      }
    }

    // Fallback to Tesseract
    recognizedText.value = 'OCR läuft (Tesseract) — bitte warten...'
    const text = await runTesseract(canvas)
    
    if (text && text.trim()) {
      analyzeText(text)
    } else {
      recognizedText.value = '[kein Text gefunden]'
      showStatus('Kein Text erkannt', 'warning')
    }
  } catch (error) {
    console.error('OCR error:', error)
    recognizedText.value = 'Fehler bei OCR: ' + (error.message || error)
    showStatus('OCR-Fehler: ' + error.message, 'error')
  } finally {
    ocrProcessing.value = false
  }
}

// Analyze recognized text
function analyzeText(text) {
  recognizedText.value = text

  // Extract order number from text
  const lines = text.split('\n')
  for (const line of lines) {
    if (line.includes('KD-Auftrag:')) {
      const parts = line.split('KD-Auftrag:')[1].trim().split(' ')
      const foundOrderNumber = parts.find(part => /\d+\D/.test(part))
      if (foundOrderNumber) {
        orderNumber.value = foundOrderNumber
        showStatus('Auftragsnummer erkannt: ' + foundOrderNumber, 'success')
        break
      }
    }
  }
}

// Start Live OCR
function startLiveOCR() {
  if (liveInterval) return
  liveInterval = setInterval(() => {
    const video = videoRef.value
    if (!video || video.readyState < 2) return
    doOCR().catch(console.error)
  }, 1500)
}

// Stop Live OCR
function stopLiveOCR() {
  if (liveInterval) {
    clearInterval(liveInterval)
    liveInterval = null
  }
}

// Toggle Torch/Flashlight
async function toggleTorch() {
  if (!track) {
    showStatus('Kamera nicht gestartet', 'warning')
    return
  }

  const capabilities = track.getCapabilities ? track.getCapabilities() : {}
  if (!capabilities.torch) {
    showStatus('Blitzlicht wird vom Gerät/Browser nicht unterstützt', 'warning')
    return
  }

  const settings = track.getSettings()
  const isOn = settings.torch === true

  try {
    await track.applyConstraints({ 
      advanced: [{ torch: !isOn }] 
    })
    showStatus(`Blitzlicht ${!isOn ? 'ein' : 'aus'}geschaltet`, 'success')
  } catch (error) {
    console.warn('Torch error:', error)
    showStatus('Blitzlicht konnte nicht umgeschaltet werden', 'error')
  }
}

// Show status message
function showStatus(message, type = 'info') {
  statusMessage.value = message
  statusType.value = type
  
  // Auto-clear success/info messages after 3 seconds
  if (type === 'success' || type === 'info') {
    setTimeout(() => {
      if (statusMessage.value === message) {
        statusMessage.value = ''
      }
    }, 3000)
  }
}

// Watch for live OCR toggle
watch(liveOcrEnabled, (newValue) => {
  if (newValue) {
    startLiveOCR()
  } else {
    stopLiveOCR()
  }
})

// Cleanup on component unmount
onBeforeUnmount(() => {
  stopCamera()
  stopLiveOCR()
  if (tesseractWorker) {
    tesseractWorker.terminate()
  }
})
</script>

<style scoped>
.video-container {
  position: relative;
  width: 100%;
  background: #000;
  border-radius: 4px;
  overflow: hidden;
}

.video-element {
  width: 100%;
  max-height: 40vh;
  display: block;
  background: #000;
}
</style>
