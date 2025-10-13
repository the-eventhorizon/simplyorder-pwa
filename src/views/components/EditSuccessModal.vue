<template>
  <ion-modal :isOpen="isOpen" @did-dismiss="closeModal">
    <div v-if="article" class="modal-content">
      <div class="header">
        <div class="header-text">
          <p>Bestätigung</p>
        </div>
        <div class="close">
          <ion-button fill="clear" @click="closeModal">
            <ion-icon slot="icon-only" :icon="closeCircle"></ion-icon>
          </ion-button>
        </div>
        <div class="title">
          <h2>Bestand aktualisiert</h2>
        </div>
      </div>
      <ion-card>
        <ion-card-content>
          <div class="card-header">
            <div class="image">
              <img :src="baseUrl + article.image" :alt="article.articleNumber">
            </div>
            <div class="title">
              <h2>{{ article.description }}</h2>
              <p>Bestand: {{ article.amount }}/{{ article.minAmount }} Mindestbestand</p>
            </div>
          </div>
          <button class="remove-button" @click="checkStock">Bestand prüfen</button>
        </ion-card-content>
      </ion-card>
      <div class="managing-buttons">
        <button @click="closeAll">{{ currentPath.includes('scanner') ? 'Weiteren Artikel scannen' : 'Zurück zu Artikeln' }}</button>
      </div>
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
      flex-direction: column;
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
          margin-top: 15px;
        }
      }

      .title {
        h2 {
          font-size: 1.5rem;
          margin-bottom: 15px;
          margin-top: 0;
          padding: 0;
          text-transform: uppercase;
        }
      }

      .close {
        position: absolute;
        right: 10px;
        ion-button {
          --background: transparent;
          --color: #123274;
          ion-icon {
            height: 30px;
            width: 30px;
          }
        }
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;

      .image {
        width: 50px;
        height: 50px;
        margin-right: 10px;

        img {
          width: 100%;
          height: auto;
          border-radius: 5px;
        }
      }

      h2 {
        font-weight: bold;
        margin-bottom: 5px;
      }
    }

    .description {
      padding: 10px;
      margin-bottom: 10px;
      background: #f2f2f2;
      border-radius: 8px;

      h3 {
        font-weight: bold;
        margin-bottom: 10px;
      }
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      gap: 10px;

      ion-button {
        min-width: 56px;
        height: 56px;
        --border-radius: 8px;
        --background: #f59c00;
        --color: #fff;
      }

      .amount-display {
        height: 54px;
        text-align: center;
        font-size: 1.2rem;
        border: 1px solid #c7c7c7;
        border-radius: 8px;
      }
    }

    .remove-button {
      width: 100%;
      padding: 16px;
      font-size: 16px;
      background: #f59c00;
      color: #fff;
      border-radius: 8px;
      margin-bottom: 10px;
    }

    .managing-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: space-between;
      margin-top: 10px;
      margin-bottom: 5px;
      padding: 10px;

      button {
        width: 100%;
        padding: 16px;
        font-size: 16px;
        background: #f59c00;
        color: #fff;
        border-radius: 8px;
      }
    }
  }
}

</style>

<script lang="ts">
import {ref, computed} from 'vue';
import {Article} from "@/interfaces/Article";
import {BASE_URL} from "@/constants";
import {useRoute} from "vue-router";
import ApiService from "@/services/ApiService";
import {IonCardContent, IonCard, IonButton, IonModal, IonIcon} from "@ionic/vue";
import {Browser} from "@capacitor/browser";
import {closeCircle} from "ionicons/icons";

export default {
  components: {
    IonModal,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon
  },
  props: {
    isOpen: Boolean,
    article: Object as () => Article
  },
  emits: ['close', 'openStock'],
  setup(props, {emit}) {
    const route = useRoute();
    const currentPath = route.path;
    const baseUrl = BASE_URL;
    const amountToRemove = ref(Number.parseInt(props.article!.amount) > 0 ? 1 : 0);
    const isStockModalOpen = ref(false);

    const increaseAmount = () => {
      if (amountToRemove.value < Number.parseInt(props.article!.amount)) {
        amountToRemove.value++;
        console.log(formattedAmount.value)
      }
    };

    const decreaseAmount = () => {
      if (amountToRemove.value > 1) {
        amountToRemove.value--;
        console.log(formattedAmount.value)
      }
    };

    const checkStock = () => {
      emit("openStock");
      closeModal()
    };

    const updateStock = async (newAmount: string) => {
      await ApiService.changeAmount(props.article!.articleNumber, newAmount);
      props.article!.amount = newAmount;
      const criticalItems = await ApiService.getCriticalItems();
      localStorage.setItem('criticalItems', JSON.stringify(criticalItems.criticalStock));
      closeModal();
    }

    const formattedAmount = computed(() => `${amountToRemove.value}/${Number.parseInt(props.article!.amount)}`);

    async function openInBrowser() {
      const url = `${baseUrl}index.php?site=articleselection&query=${props.article!.articleNumber}`;
      await Browser.open({url});
    }

    function closeAll() {
      closeModal();
    }

    const closeModal = () => {
      emit("close");
    };

    return {
      closeAll,
      closeModal,
      checkStock,
      updateStock,
      openInBrowser,
      increaseAmount,
      decreaseAmount,
      baseUrl,
      currentPath,
      amountToRemove,
      formattedAmount,
      isStockModalOpen,
      closeCircle,
    }
  }
};
</script>