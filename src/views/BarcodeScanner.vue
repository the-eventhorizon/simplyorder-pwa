<template>
  <MainLayout>
    <!-- Input for USB Scanners -->
    <div id="video-container" v-if="hasCamera" style="display: none">
      <video id="video" ref="video" autoplay playsinline style="opacity: 0"></video>
      <div class="overlay">
        <img id="scanner-overlay" src="@/assets/images/Scanner.png" alt="QR Code Scanner" style="opacity: 0"/>
      </div>
      <div class="close-button">
        <ion-button fill="clear" @click="$router.back()">
          <ion-icon slot="icon-only" :icon="closeCircle"></ion-icon>
        </ion-button>
      </div>
    </div>
    <div id="error-container" style="display: none">
      <p>
        Zugriff auf Kamera fehlgeschlagen.
      </p>
      <button @click="retry">
        Erneut versuchen
      </button>
      <button @click="barcodeInputVisible=true" v-if="!barcodeInputVisible">
        Barcode manuell eingeben
      </button>
      <div class="manual-input" v-if="barcodeInputVisible">
        <form @submit.prevent="handleBarcodeInput">

          <div class="form-group">
            <input v-model="barcodeInput" placeholder="Barcode eingeben"/>
            <button type="submit">
              Barcode überprüfen
            </button>
          </div>
        </form>
      </div>
    </div>
  </MainLayout>

  <EditArticleModal v-if="selectedArticle" :isOpen="isEditModalOpen" :article="selectedArticle"
                    @close="closeModal('edit')" @openStock="isStockModalOpen = true" @updateArticle="updateArticle"
                    @openSuccess="isSuccessModalOpen = true"/>
  <EditSuccessModal v-if="selectedArticle" :isOpen="isSuccessModalOpen" :article="selectedArticle"
                    @close="closeModal('success')" @openStock="isStockModalOpen = true"/>
  <StockModal v-if="selectedArticle" :isOpen="isStockModalOpen" :article="selectedArticle"
              @close="closeModal('stock')" @updateArticle="updateArticle"
              @openDetails="isDetailsModalOpen = true"/>
  <StockDetailsModal v-if="selectedArticle" :isOpen="isDetailsModalOpen" :article="selectedArticle"
                     @close="closeModal('detail')" @updateArticle="updateArticle"/>
</template>
<style scoped lang="scss">
#video-container {
  position: relative;
  height: calc(100vh - 112px - (var(--safe-area-inset-bottom) * 1.75));
  max-width: 600px;

  video {
    height: 100%;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    img {
      width: 80%;
      height: auto;
    }
  }

  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1;

    ion-button {
      background-color: transparent;
      color: #f59c00;
      font-size: 30px;
      --padding-start: 0;
      --padding-end: 0;
      --padding-top: 0;
      --padding-bottom: 0;
    }
  }
}

#error-container {
  padding: 16px;
  flex-direction: column;
  button {
    border-radius: 8px;
    font-size: 16px;
    padding: 16px;
    background-color: #f59c00;
    margin-bottom: 8px;
  }

  .manual-input {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 20px;

    form {
      width: 100%;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      color: black;
      margin-bottom: 16px;

      input {
        background: transparent;
        border: 1px solid #c7c7c7;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 8px;
      }
    }
  }
}
</style>
<script lang="ts">
import {IonIcon} from "@ionic/vue";
import {closeCircle} from "ionicons/icons";
import {ref, onMounted} from 'vue';
import {BrowserMultiFormatReader} from '@zxing/library';
import ApiService from "@/services/ApiService";
import MainLayout from "~/layouts/MainLayout.vue";
import StockModal from "~/components/StockModal.vue";
import EditArticleModal from "~/components/EditArticleModal.vue";
import StockDetailsModal from "~/components/StockDetailsModal.vue";
import EditSuccessModal from "~/components/EditSuccessModal.vue";
import {Article} from "@/interfaces/Article";

export default {
  components: {
    EditSuccessModal, StockDetailsModal, EditArticleModal, StockModal,
    MainLayout, IonIcon
  },
  setup() {
    const video = ref<HTMLVideoElement | null>(null);
    const barcodeInput = ref("");
    const hasCamera = ref<boolean>(false);
    let codeReader: BrowserMultiFormatReader | null = null;
    const scannedBarcode = ref("");
    const isCameraActive = ref(false);
    const customerNumber = localStorage.getItem('customerNumber');
    const isEditModalOpen = ref(false);
    const isStockModalOpen = ref(false);
    const isDetailsModalOpen = ref(false);
    const isSuccessModalOpen = ref(false);
    const selectedArticle = ref<Article | null>(null);
    const barcodeInputVisible = ref(false);


    onMounted(async () => {
      // Check if camera is available
      const devices = await navigator.mediaDevices.enumerateDevices();
      hasCamera.value = devices.some(device => device.kind === 'videoinput');
      // request camera access
      await checkPermissions();
      await startScan();
    })

    async function startScan() {
      isCameraActive.value = true;
      codeReader = new BrowserMultiFormatReader();

      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log(devices);
      const deviceId = devices.find(device => device.kind === 'videoinput' && device.label.includes('facing back'))?.deviceId;
      console.log(deviceId);

      try {
        await codeReader.decodeFromVideoDevice(null, video.value!, (result) => {
          if (result) {
            scannedBarcode.value = result.getText();
            submitBarcode(scannedBarcode.value);
            stopScan();
          }
        });
        // force autoplay of the video element
        document.getElementById('error-container')!.style.display = 'none';
        document.getElementById('video-container')!.style.display = 'block';
        await video.value!.play().catch(e => console.error('Error playing video:', e));
        document.getElementById('scanner-overlay')!.style.opacity = '1';
        document.getElementById('video')!.style.opacity = '1';
      } catch (error) {
        console.error('Web scan error:', error);
        document.getElementById('error-container')!.style.display = 'flex';
      }
    }

    async function stopScan() {
      if (codeReader) {
        document.getElementById('video-container')!.style.display = 'none';
        codeReader.reset();
        isCameraActive.value = false;
        scannedBarcode.value = "";
        const stream = video.value!.srcObject as MediaStream | null;
        stream?.getTracks().forEach(track => track.stop());
        video.value!.srcObject = null;
      }
    }

    async function handleBarcodeInput() {
      console.log("USB Scanner Input: ", barcodeInput.value);
      await submitBarcode(barcodeInput.value);
    }

    async function submitBarcode(barcode: string) {
      console.log(barcode);
      try {
        const article = await ApiService.findArticleByBarcode(barcode, customerNumber!);
        if (article && article[0].articleNumber != null) {
          selectedArticle.value = article[0];
          isEditModalOpen.value = true;
        } else {
          alert("Keinen Artikel mit der EAN " + barcode + " gefunden.");
          await stopScan();
          await new Promise(r => setTimeout(r, 500)); // small delay to avoid issues on some devices
          await startScan();
        }
      } catch (error) {
        console.error("Error finding article:", error);
        await stopScan();
        await new Promise(r => setTimeout(r, 500)); // small delay to avoid issues on some devices
        await startScan();
      }
    }

    async function closeModal(modal: string) {
      switch (modal) {
        case 'edit':
          isEditModalOpen.value = false;
          break;
        case 'success':
          isSuccessModalOpen.value = false;
          break;
        case 'stock':
          isStockModalOpen.value = false;
          break;
        case 'detail':
          isDetailsModalOpen.value = false;
          break;
      }
      // Restart the scan after closing all the modals
      if (isEditModalOpen.value || isSuccessModalOpen.value || isStockModalOpen.value || isDetailsModalOpen.value) {
        return;
      }
      await stopScan();
      await new Promise(r => setTimeout(r, 500)); // small delay to avoid issues on some devices
      await startScan();
    }

    async function checkPermissions() {
      if (!navigator.permissions) return;

      const status = await navigator.permissions.query({name: 'camera' as PermissionName});
      if (status.state === 'denied') {
        alert("Kamera-Zugriff verweigert. Bitte erlauben Sie den Zugriff auf die Kamera.");
      }
    }

    async function retry() {
      const stream = await navigator.mediaDevices.getUserMedia({video: true});
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      await startScan();
    }

    function updateArticle(updatedArticle: Article) {
      stopScan();
      selectedArticle.value = updatedArticle;
    }

    return {
      retry,
      closeModal,
      updateArticle,
      handleBarcodeInput,
      video,
      hasCamera,
      barcodeInput,
      scannedBarcode,
      isCameraActive,
      isEditModalOpen,
      selectedArticle,
      isStockModalOpen,
      isDetailsModalOpen,
      isSuccessModalOpen,
      barcodeInputVisible,
      closeCircle,
    }
  },

}
</script>