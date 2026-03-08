<template>
  <div class="photo-upload">
    <label class="photo-label">Photo d'identité</label>
    
    <div class="photo-preview-container">
      <div v-if="previewUrl" class="preview-wrapper">
        <img :src="previewUrl" alt="Aperçu" class="preview-img" />
        <button type="button" @click="clearPhoto" class="btn-remove" title="Supprimer">×</button>
      </div>
      <div v-else class="preview-placeholder">
        <span class="placeholder-icon">📷</span>
      </div>
    </div>

    <div class="photo-actions">
      <!-- Upload depuis l'ordinateur -->
      <label class="btn-action">
        📁 Fichier
        <input type="file" @change="handleFileUpload" accept="image/*" class="file-input" />
      </label>

      <!-- Utilisation de la Caméra -->
      <button type="button" @click="openCameraModal" class="btn-action">
        🎥 Webcam
      </button>
    </div>

    <!-- Modale Caméra -->
    <div v-if="isCameraOpen" class="camera-modal-overlay">
      <div class="camera-modal">
        <div class="camera-header">
          <h3>Prendre une photo</h3>
          <button @click="closeCamera" class="btn-close-modal">×</button>
        </div>
        
        <div class="camera-body">
          <div class="camera-info">Placez-vous bien en face de l'objectif</div>
          <div class="video-wrapper">
            <video ref="video" autoplay playsinline muted class="video-stream"></video>
          </div>
          <canvas ref="canvas" style="display: none;"></canvas>
        </div>

        <div class="camera-footer">
          <button type="button" @click="takePhoto" class="btn-capture">Prendre la photo</button>
          <button type="button" @click="closeCamera" class="btn-cancel">Annuler</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, watch, nextTick } from 'vue';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits(['update:modelValue', 'photoData']);

const previewUrl = ref(props.modelValue);

watch(() => props.modelValue, (newVal) => {
  previewUrl.value = newVal;
});
const isCameraOpen = ref(false);
const video = ref<HTMLVideoElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const stream = ref<MediaStream | null>(null);

// Gérer le téléchargement de fichier
const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    
    // On utilise un FileReader pour lire le fichier, puis un canvas pour l'optimiser
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Utiliser un canvas temporaire car le ref canvas peut être null si modale fermée
        const tempCanvas = document.createElement('canvas');
        const ctx = tempCanvas.getContext('2d');
        if (!ctx) return;

        // Dimensions cibles (max 1200px de large/haut pour l'optimisation)
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        tempCanvas.width = width;
        tempCanvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Exportation en JPEG avec une qualité réduite pour viser < 500Ko
        const base64 = tempCanvas.toDataURL('image/jpeg', 0.7);
        updatePhoto(base64);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

// Gérer la caméra
const openCameraModal = async () => {
  try {
    isCameraOpen.value = true;
    
    // Attendre que le DOM soit mis à jour pour avoir accès à la ref video
    await nextTick();

    const mediaStream = await navigator.mediaDevices.getUserMedia({ 
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user"
      },
      audio: false 
    });
    
    stream.value = mediaStream;
    
    if (video.value) {
      video.value.srcObject = mediaStream;
      await video.value.play();
    }
  } catch (err) {
    console.error("Erreur accès caméra:", err);
    alert("Impossible d'accéder à la caméra. Vérifiez les permissions.");
    isCameraOpen.value = false;
  }
};

const takePhoto = () => {
  if (video.value && canvas.value) {
    const context = canvas.value.getContext('2d');
    if (!context) return;
    
    canvas.value.width = video.value.videoWidth;
    canvas.value.height = video.value.videoHeight;
    
    // Effet miroir pour la capture
    context.translate(canvas.value.width, 0);
    context.scale(-1, 1);
    context.drawImage(video.value, 0, 0);
    context.setTransform(1, 0, 0, 1, 0, 0);
    
    const base64 = canvas.value.toDataURL('image/jpeg', 0.8);
    updatePhoto(base64);
    closeCamera();
  }
};

const closeCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop());
    stream.value = null;
  }
  isCameraOpen.value = false;
};

const updatePhoto = (base64: string) => {
  previewUrl.value = base64;
  emit('update:modelValue', base64);
};

const clearPhoto = () => {
  previewUrl.value = '';
  emit('update:modelValue', '');
};

const clearPhotoFromParent = () => {
  clearPhoto();
};

onBeforeUnmount(() => {
  closeCamera();
});

defineExpose({ clearPhotoFromParent });
</script>

<style scoped>
.photo-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  width: 100%;
}

.photo-label {
  align-self: flex-start;
  color: #e2e8f0;
  font-weight: 500;
}

.photo-preview-container {
  width: 150px;
  height: 150px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px dashed #444;
  background: #0f0f1e;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #fb7185;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-weight: bold;
}

.placeholder-icon {
  font-size: 3rem;
  opacity: 0.3;
}

.photo-actions {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}

.btn-action {
  flex: 1;
  padding: 0.6rem;
  background: #1e1e30;
  color: white;
  border: 1px solid #334155;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-action:hover {
  background: #2d2d44;
  border-color: #6366f1;
}

.file-input {
  display: none;
}

/* Styles Modale Caméra */
.camera-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.camera-modal {
  background: #1e1e30;
  width: 90%;
  max-width: 500px;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border: 1px solid #334155;
  color: white;
}

.camera-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.camera-header h3 {
  margin: 0;
}

.btn-close-modal {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.5rem;
  cursor: pointer;
}

.camera-info {
  text-align: center;
  color: #818cf8;
  font-weight: bold;
  margin-bottom: 1rem;
}

.video-wrapper {
  width: 100%;
  aspect-ratio: 4/3;
  background: black;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #334155;
}

.video-stream {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

.camera-footer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-capture {
  padding: 0.8rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.btn-cancel {
  padding: 0.8rem;
  background: #334155;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-capture:hover { background: #4f46e5; }
.btn-cancel:hover { background: #475569; }
</style>