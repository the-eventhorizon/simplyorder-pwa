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
          <div class="amount-details">
            <h3>Bestand</h3>
            <div class="stock">
              <span>Lager:</span>
              <span>{{ article.amount }}</span>
            </div>
            <div class="stock">
              <span>Mindestbestand:</span>
              <span>{{ article.minAmount }}</span>
            </div>
          </div>
          <button class="remove-button" @click="checkStock">Bestanddetails bearbeiten</button>
        </ion-card-content>
      </ion-card>
      <div class="managing-buttons">
        <button @click="openInBrowser">Jetzt Nachbestellen</button>
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

    .description, .price {
      padding: 10px 20px;
      background: #f2f2f2;
      border-radius: 8px;

      h3 {
        font-weight: bold;
        margin-bottom: 10px;
      }
    }

    .amount-details {
      h3 {
        font-weight: bold;
        margin-bottom: 10px;

      }
      .stock {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
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
import {Article} from "@/interfaces/Article";
import {BASE_URL} from "@/constants";
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
  emits: ['close', 'openDetails', 'updateArticle'],
  setup(props, {emit}) {
    const baseUrl = BASE_URL;
    const canViewPrices = JSON.parse(localStorage.getItem('userRights')!).some((right: any) => right.id === 17);

    const checkStock = () => {
      emit("openDetails");
      closeModal();
    };

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
      baseUrl,
      canViewPrices,
      closeCircle,
    }
  }
};
</script>