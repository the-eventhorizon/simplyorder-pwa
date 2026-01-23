<template>
  <ion-modal :isOpen="isOpen" @did-dismiss="closeModal">
    <div class="modal-content">
      <div class="header">
        <div class="header-text">
          <p>Neue Anfrage</p>
        </div>
        <div class="close">
          <ion-button fill="clear" @click="closeModal">
            <ion-icon slot="icon-only" :icon="closeCircle"></ion-icon>
          </ion-button>
        </div>
      </div>
      <ion-card>
        <ion-card-content>
          <form @submit.prevent="sendRequest">
            <div class="form-group">
              <label for="subject">Thema</label>
              <input class="request-input" type="text" id="subject" v-model="subject"/>
            </div>
            <div class="form-group">
              <label for="message">Nachricht</label>
              <textarea class="request-input" id="message" v-model="message" rows="10"></textarea>
            </div>
            <div class="form-group">
              <button type="submit">Anfrage senden</button>
            </div>
          </form>
        </ion-card-content>
      </ion-card>
    </div>
  </ion-modal>
</template>
<style scoped lang="scss">
ion-modal {
  --height: fit-content;
  --border-radius: 10px;

  .modal-content {
    padding: 0;
    background: #d0deed;

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-text {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        p {
          font-size: 1.2rem;
          padding: 0;
        }
      }

      .close {
        ion-button {
          --background: transparent;
          --color: #123274;
        }
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      color: black;
      margin-bottom: 16px;

      label {
        font-size: 16px;
        margin-bottom: 8px;
      }

      .request-input {
        background: transparent;
        border: 1px solid #c7c7c7;
        padding: 16px;
        border-radius: 8px;
      }

      button {
        border-radius: 8px;
        font-size: 16px;
        padding: 16px;
        background-color: #f59c00;
        color: white;
        border: none;
        cursor: pointer;
      }
    }
  }
}
</style>
<script lang="ts">
import {closeCircle} from "ionicons/icons";
import {IonModal, IonIcon, IonCard, IonCardContent, IonButton} from "@ionic/vue";
import {ref} from "vue";
import ApiService from "@/services/ApiService";

export default {
  components: {
    IonModal, IonCard, IonCardContent, IonIcon, IonButton
  },
  props: {
    isOpen: Boolean
  },
  emits: ['close', 'updateRequests'],
  setup(props, {emit}) {
    const subject = ref("");
    const message = ref("");
    const customerNumber = localStorage.getItem('customerNumber') || "";

    const closeModal = () => {
      emit('close');
    };

    const sendRequest = async () => {
      await ApiService.sendRequest(customerNumber!, subject.value, message.value);
      emit('updateRequests');
      closeModal();
    }

    return {
      closeModal,
      sendRequest,
      subject,
      message,
      customerNumber,
      closeCircle
    }
  }
}
</script>