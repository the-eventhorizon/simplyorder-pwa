<template>
  <ion-modal :isOpen="isOpen" @did-dismiss="closeModal">
    <div v-if="article" class="modal-content">
      <div class="header">
        <div class="header-text">
          <p>Artikel</p>
        </div>
        <div class="close">
          <ion-button fill="clear" @click="closeModal">
            <ion-icon slot="icon-only" :icon="closeCircle"></ion-icon>
          </ion-button>
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
              <p>Bestand: {{ articleAmount }}/{{ article.minAmount }} Mindestbestand</p>
            </div>
          </div>
          <div class="description">
            <h3>Beschreibung:</h3>
            <p>{{ article.description2 }}</p>
          </div>
          <div class="price" v-show="canViewPrices">
            <h3>Preis:</h3>
            <p>{{ Number.parseFloat(article.price).toFixed(2).replace('.', ',') }} €</p>
          </div>
          <p><strong>Aus Bestand nehmen:</strong></p>
          <div class="quantity-controls">
            <ion-button fill="clear" slot="start" @click="decreaseAmount">-</ion-button>
            <ion-input type="text" readonly class="amount-display" :value="formattedAmount"/>
            <ion-button fill="clear" slot="end" @click="increaseAmount">+</ion-button>
          </div>
          <button class="remove-button" @click="removeFromStock">Artikel entnehmen</button>
        </ion-card-content>
      </ion-card>
      <div class="managing-buttons">
        <button @click="checkStock">Bestand prüfen</button>
        <button @click="openInBrowser">Nachbestellen</button>
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

    .description, .price {
      padding: 10px;
      background: #f2f2f2;

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
import {ref, computed, watch} from 'vue';
import {Article} from "@/interfaces/Article";
import {BASE_URL} from "@/constants";
import ApiService from "@/services/ApiService";
import {IonCardContent, IonCard, IonButton, IonInput, IonModal, IonIcon} from "@ionic/vue";
import {Browser} from "@capacitor/browser";
import {closeCircle} from "ionicons/icons";

export default {
  components: {
    IonModal,
    IonCard,
    IonCardContent,
    IonButton,
    IonInput,
    IonIcon
  },
  props: {
    isOpen: Boolean,
    article: Object as () => Article
  },
  emits: ['close', 'updateArticle', 'openStock', 'openSuccess'],
  setup(props, {emit}) {
    const baseUrl = BASE_URL;
    const amountToRemove = ref(Number.parseInt(props.article!.amount) > 0 ? 1 : 0);
    const articleAmount = ref(Number.parseInt(props.article!.amount));
    const updatedArticle = ref({...props.article!});
    const canViewPrices = JSON.parse(localStorage.getItem('userRights')!).some((right: any) => right.id === 17);
    const customerNumber = localStorage.getItem('customerNumber');

    watch(() => props.article!, (newArticle) => {
      updatedArticle.value = {...newArticle}
      articleAmount.value = Number.parseInt(newArticle!.amount);
      amountToRemove.value = Number.parseInt(newArticle!.amount) > 0 ? 1 : 0;
    });

    const increaseAmount = () => {
      if (amountToRemove.value < Number.parseInt(props.article!.amount)) {
        amountToRemove.value++;
      }
    };

    const decreaseAmount = () => {
      if (amountToRemove.value > 1) {
        amountToRemove.value--;
      }
    };

    const removeFromStock = async () => {
      if (Number.parseInt(props.article!.amount) < amountToRemove.value) {
        alert("Nicht genügend Bestand vorhanden.");
        return;
      }
      await ApiService.reduceAmount(customerNumber!, props.article!.articleNumber, amountToRemove.value);
      articleAmount.value -= amountToRemove.value;
      updatedArticle.value.amount = articleAmount.value.toString();
      const criticalItems = await ApiService.getCriticalItems(customerNumber!);
      localStorage.setItem('criticalItems', JSON.stringify(criticalItems.criticalStock));
      emit("updateArticle", updatedArticle.value);
      emit("openSuccess");
      closeModal();
    };

    const checkStock = () => {
      emit("openStock", updatedArticle.value);
      closeModal();
    };

    const formattedAmount = computed(() => `${amountToRemove.value}/${Number.parseInt(props.article!.amount)}`);

    async function openInBrowser() {
      const url = `${baseUrl}index.php?site=articleselection&query=${props.article!.articleNumber}`;
      await Browser.open({url});
    }

    const closeModal = () => {
      emit("close");
    };

    return {
      checkStock,
      closeModal,
      openInBrowser,
      increaseAmount,
      decreaseAmount,
      removeFromStock,
      baseUrl,
      articleAmount,
      canViewPrices,
      updatedArticle,
      amountToRemove,
      formattedAmount,
      closeCircle
    }
  }
};
</script>