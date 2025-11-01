<template>
  <v-card elevation="2">
    <v-card-title class="bg-primary text-white d-flex align-center">
      <v-icon start>mdi-barcode-scan</v-icon>
      <span class="flex-grow-1">KD-Nummer erfassen</span>
      <v-btn icon variant="text" @click="$emit('close')" size="small">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text class="pa-4">
      <!-- Tab Navigation -->
      <v-tabs v-model="activeTab" class="mb-4" bg-color="primary" grow>
        <v-tab value="scan">
          <v-icon start>mdi-camera</v-icon>
          Scannen
        </v-tab>
        <v-tab value="manual">
          <v-icon start>mdi-keyboard</v-icon>
          Manuell
        </v-tab>
      </v-tabs>

      <!-- Scan Tab -->
      <v-window v-model="activeTab">
        <v-window-item value="scan">
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
            <v-col>
              <v-btn
                block
                size="large"
                :color="cameraActive ? 'error' : 'success'"
                @click="toggleCamera"
                prepend-icon="mdi-camera"
              >
                Kamera {{ cameraActive ? "Stop" : "Start" }}
              </v-btn>
            </v-col>

            <v-col>
              <v-btn
                block
                size="large"
                color="warning"
                :disabled="!cameraActive"
                @click="toggleTorch"
                prepend-icon="mdi-flashlight"
              >
                Blitzlicht
              </v-btn>
            </v-col>
          </v-row>

          <!-- OCR Result Text Area -->
          <v-textarea
            v-model="recognizedText"
            label="Erkannter Text"
            placeholder="Erkannter Text erscheint hier..."
            rows="4"
            readonly
            variant="outlined"
            class="mb-4"
          ></v-textarea>

          <!-- Order Number Display (only in scan tab) -->
          <v-text-field
            v-model="orderNumber"
            label="Erkannte KD-Nummer"
            readonly
            variant="outlined"
            class="large-input mb-4"
            prepend-icon="mdi-barcode"
            :color="orderNumber ? 'success' : ''"
          ></v-text-field>

          <!-- Continue Button (only in scan tab) -->
          <v-btn
            block
            size="x-large"
            color="success"
            prepend-icon="mdi-arrow-right"
            @click="continueToLagerplatz"
            :disabled="!orderNumber"
          >
            Lagerplatz wählen
          </v-btn>
        </v-window-item>

        <!-- Manual Entry Tab -->
        <v-window-item value="manual">
          <v-alert type="info" variant="tonal" class="mb-4">
            Gib die KD-Nummer manuell ein, wenn der Scan nicht
            funktioniert.
          </v-alert>

          <v-text-field
            v-model="manualKdNummer"
            label="KD-Nummer manuell eingeben"
            placeholder="z.B. 12345A"
            variant="outlined"
            class="large-input mb-4"
            prepend-icon="mdi-barcode"
            clearable
            autofocus
            @keyup.enter="isManualKdNummerValid ? continueWithManualEntry() : null"
          ></v-text-field>

          <!-- Continue Button (manual tab) -->
          <v-btn
            block
            size="x-large"
            color="success"
            prepend-icon="mdi-arrow-right"
            @click="continueWithManualEntry"
            :disabled="!isManualKdNummerValid"
          >
            Lagerplatz wählen
          </v-btn>
        </v-window-item>
      </v-window>

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
import { ref, computed, watch, onBeforeUnmount } from "vue";
import { createWorker } from "tesseract.js";

const emit = defineEmits(["kdNummerSelected", "close"]);

// Refs
const activeTab = ref("scan");
const videoRef = ref(null);
const cameraActive = ref(false);
const ocrProcessing = ref(false);
const recognizedText = ref("");
const orderNumber = ref("");
const manualKdNummer = ref("");
const statusMessage = ref("");
const statusType = ref("info");

// Computed: Validate manual KD-Nummer (same rule as scan: at least one digit followed by a non-digit)
const isManualKdNummerValid = computed(() => {
  if (!manualKdNummer.value || !manualKdNummer.value.trim()) {
    return false;
  }
  // Same validation as in analyzeText: /\d+\D/.test(part)
  return /\d+\D/.test(manualKdNummer.value.trim());
});

// Internal state
let stream = null;
let track = null;
let liveInterval = null;
let usingTextDetector = false;
let textDetector = null;
let tesseractWorker = null;
let tesseractLoaded = false;

// Canvas for capturing frames
const offCanvas = document.createElement("canvas");
const offCtx = offCanvas.getContext("2d");

function toggleCamera() {
  if (cameraActive.value) {
    stopCamera();
  } else {
    startCamera();
  }
}

// Start Camera
async function startCamera() {
  try {
    // Try with exact environment facing mode first
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: "environment" },
          width: { ideal: 1280 },
        },
        audio: false,
      });
    } catch (err) {
      // Fallback without exact constraint
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
        },
        audio: false,
      });
    }

    if (videoRef.value) {
      videoRef.value.srcObject = stream;
      track = stream.getVideoTracks()[0];
      cameraActive.value = true;

      // Check for TextDetector API support
      if ("TextDetector" in window) {
        try {
          textDetector = new TextDetector();
          usingTextDetector = true;
          console.log("TextDetector available - using native API");
          showStatus("Kamera und Video-Texterkennung gestartet", "success");
        } catch (e) {
          usingTextDetector = false;
          showStatus("Kamera gestartet - Video-Texterkennung aktiv", "success");
        }
      } else {
        usingTextDetector = false;
        showStatus("Kamera gestartet - Video-Texterkennung aktiv", "success");
      }

      // Automatically start live OCR
      startLiveOCR();
    }
  } catch (error) {
    console.error("Camera error:", error);
    showStatus("Kamera-Zugriff fehlgeschlagen: " + error.message, "error");
  }
}

// Stop Camera
function stopCamera() {
  // Stop live OCR first
  stopLiveOCR();

  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
    track = null;
  }
  cameraActive.value = false;
  if (videoRef.value) {
    videoRef.value.srcObject = null;
  }

  showStatus("Kamera und Video-Texterkennung gestoppt", "info");
}

// Capture Frame from Video
function captureFrame() {
  const video = videoRef.value;
  if (!video || !video.videoWidth || !video.videoHeight) {
    return null;
  }

  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const maxW = 1024;

  let w = vw;
  let h = vh;
  if (w > maxW) {
    const ratio = maxW / w;
    w = maxW;
    h = Math.round(vh * ratio);
  }

  offCanvas.width = w;
  offCanvas.height = h;
  offCtx.drawImage(video, 0, 0, w, h);
  return offCanvas;
}

// Run Native TextDetector
async function runTextDetector(canvas) {
  if (!textDetector) return null;
  try {
    const bitmap = await createImageBitmap(canvas);
    const results = await textDetector.detect(bitmap);
    if (!results || results.length === 0) return null;

    return results.map((r) => r.rawValue).join("\n");
  } catch (e) {
    console.warn("TextDetector failed:", e);
    return null;
  }
}

// Ensure Tesseract is loaded
async function ensureTesseract() {
  if (tesseractLoaded) return;

  try {
    tesseractWorker = await createWorker("deu", 1, {
      logger: (m) => {
        if (
          m.status === "loading tesseract core" ||
          m.status === "initializing tesseract"
        ) {
          showStatus(
            `Tesseract wird geladen... ${Math.round(m.progress * 100)}%`,
            "info"
          );
        }
      },
    });
    tesseractLoaded = true;
    showStatus("Tesseract bereit", "success");
  } catch (error) {
    console.error("Tesseract initialization error:", error);
    showStatus("Tesseract-Initialisierung fehlgeschlagen", "error");
    throw error;
  }
}

// Run Tesseract OCR
async function runTesseract(canvas) {
  await ensureTesseract();
  const dataUrl = canvas.toDataURL("image/png");
  const {
    data: { text },
  } = await tesseractWorker.recognize(dataUrl);
  return text;
}

// Perform OCR
async function doOCR() {
  if (!videoRef.value || !track) return;

  try {
    ocrProcessing.value = true;
    const canvas = captureFrame();
    if (!canvas) {
      showStatus("Fehler beim Erfassen des Frames", "error");
      return;
    }

    // Try native TextDetector first
    if (usingTextDetector && textDetector) {
      const text = await runTextDetector(canvas);
      if (text) {
        analyzeText(text);
        ocrProcessing.value = false;
        return;
      }
    }

    // Fallback to Tesseract
    recognizedText.value = "OCR läuft (Tesseract) — bitte warten...";
    const text = await runTesseract(canvas);

    if (text && text.trim()) {
      analyzeText(text);
    } else {
      recognizedText.value = "[kein Text gefunden]";
      showStatus("Kein Text erkannt", "warning");
    }
  } catch (error) {
    console.error("OCR error:", error);
    recognizedText.value = "Fehler bei OCR: " + (error.message || error);
    showStatus("OCR-Fehler: " + error.message, "error");
  } finally {
    ocrProcessing.value = false;
  }
}

// Analyze recognized text
function analyzeText(text) {
  recognizedText.value = text;

  // Extract order number from text
  const lines = text.split("\n");
  for (const line of lines) {
    if (line.includes("KD-Auftrag:")) {
      const parts = line.split("KD-Auftrag:")[1].trim().split(" ");
      const foundOrderNumber = parts.find((part) => /\d+\D/.test(part));
      if (foundOrderNumber) {
        orderNumber.value = foundOrderNumber;
        showStatus("Auftragsnummer erkannt: " + foundOrderNumber, "success");
        break;
      }
    }
  }
}

// Start Live OCR
function startLiveOCR() {
  if (liveInterval) return;
  liveInterval = setInterval(() => {
    const video = videoRef.value;
    if (!video || video.readyState < 2) return;
    doOCR().catch(console.error);
  }, 1500);
}

// Stop Live OCR
function stopLiveOCR() {
  if (liveInterval) {
    clearInterval(liveInterval);
    liveInterval = null;
  }
}

// Toggle Torch/Flashlight
async function toggleTorch() {
  if (!track) {
    showStatus("Kamera nicht gestartet", "warning");
    return;
  }

  const capabilities = track.getCapabilities ? track.getCapabilities() : {};
  if (!capabilities.torch) {
    showStatus(
      "Blitzlicht wird vom Gerät/Browser nicht unterstützt",
      "warning"
    );
    return;
  }

  const settings = track.getSettings();
  const isOn = settings.torch === true;

  try {
    await track.applyConstraints({
      advanced: [{ torch: !isOn }],
    });
    showStatus(`Blitzlicht ${!isOn ? "ein" : "aus"}geschaltet`, "success");
  } catch (error) {
    console.warn("Torch error:", error);
    showStatus("Blitzlicht konnte nicht umgeschaltet werden", "error");
  }
}

// Show status message
function showStatus(message, type = "info") {
  statusMessage.value = message;
  statusType.value = type;

  // Auto-clear success/info messages after 3 seconds
  if (type === "success" || type === "info") {
    setTimeout(() => {
      if (statusMessage.value === message) {
        statusMessage.value = "";
      }
    }, 3000);
  }
}

// Continue with manual entry - validate and go to Lagerplatzauswahl
function continueWithManualEntry() {
  if (isManualKdNummerValid.value) {
    const kdNummer = manualKdNummer.value.trim();
    orderNumber.value = kdNummer;
    showStatus("KD-Nummer übernommen: " + kdNummer, "success");
    emit("kdNummerSelected", kdNummer);
  }
}

// Continue to Lagerplatz selection (for scan tab)
function continueToLagerplatz() {
  if (orderNumber.value) {
    emit("kdNummerSelected", orderNumber.value);
  }
}

// Cleanup on component unmount
onBeforeUnmount(() => {
  stopCamera();
  stopLiveOCR();
  if (tesseractWorker) {
    tesseractWorker.terminate();
  }
});
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

.large-input :deep(.v-field__input) {
  font-size: 1.3rem;
  padding: 16px;
}

/* Mobile Responsiveness */
@media (max-width: 600px) {
  /* Video Container größer auf mobil für bessere Sicht */
  .video-element {
    max-height: 50vh;
  }

  /* Tabs kompakter */
  :deep(.v-tabs) {
    font-size: 0.9rem;
  }

  :deep(.v-tab) {
    font-size: 0.9rem !important;
    padding: 8px 12px !important;
    min-width: auto !important;
  }

  :deep(.v-tab .v-icon) {
    font-size: 1.1rem !important;
  }

  /* Buttons kompakter */
  :deep(.v-btn[size="large"]) {
    height: 44px !important;
    font-size: 0.9rem !important;
    padding: 0 12px !important;
  }

  :deep(.v-btn[size="x-large"]) {
    height: 48px !important;
    font-size: 1rem !important;
  }

  /* Button Icons kleiner */
  :deep(.v-btn .v-icon) {
    font-size: 1.1rem !important;
  }

  /* Eingabefelder */
  .large-input :deep(.v-field__input) {
    font-size: 1.1rem;
    padding: 12px;
  }

  /* Textarea kompakter */
  :deep(.v-textarea) {
    font-size: 0.95rem;
  }

  /* Switch kompakter */
  :deep(.v-switch) {
    font-size: 0.9rem;
  }

  :deep(.v-switch .v-label) {
    font-size: 0.9rem !important;
  }

  /* Alert-Boxen */
  :deep(.v-alert) {
    font-size: 0.9rem;
  }

  /* Card Padding reduzieren */
  :deep(.v-card-text.pa-4) {
    padding: 12px !important;
  }

  /* Card Title */
  :deep(.v-card-title) {
    font-size: 1.1rem !important;
    padding: 12px 16px !important;
  }

  :deep(.v-card-title .v-icon) {
    font-size: 1.3rem !important;
  }
}

/* Sehr kleine Bildschirme (< 400px) */
@media (max-width: 400px) {
  /* Video noch größer auf sehr kleinen Bildschirmen */
  .video-element {
    max-height: 55vh;
  }

  /* Buttons noch kompakter */
  :deep(.v-btn[size="large"]) {
    height: 40px !important;
    font-size: 0.85rem !important;
  }

  :deep(.v-btn[size="x-large"]) {
    height: 44px !important;
    font-size: 0.95rem !important;
  }

  /* Tab-Text eventuell kürzen durch kleinere Schrift */
  :deep(.v-tab) {
    font-size: 0.85rem !important;
    padding: 6px 8px !important;
  }

  /* Eingabefelder kleiner */
  .large-input :deep(.v-field__input) {
    font-size: 1rem;
    padding: 10px;
  }
}

/* Landscape Modus auf mobilen Geräten */
@media (max-width: 900px) and (orientation: landscape) {
  /* Video kleiner im Landscape-Modus */
  .video-element {
    max-height: 60vh;
  }
}
</style>
