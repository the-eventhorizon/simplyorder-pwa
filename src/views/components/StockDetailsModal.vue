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
          <p><strong>Lagerbestand anpassen:</strong></p>
          <div class="quantity-controls">
            <ion-button fill="clear" slot="start" @click="decreaseAmount('currentAmount')">-</ion-button>
            <ion-input type="text" readonly class="amount-display" :value="articleAmount"/>
            <ion-button fill="clear" slot="end" @click="increaseAmount('currentAmount')">+</ion-button>
          </div>
          <p><strong>Mindestbestand anpassen:</strong></p>
          <div class="quantity-controls">
            <ion-button fill="clear" slot="start" @click="decreaseAmount('minAmount')">-</ion-button>
            <ion-input type="text" readonly class="amount-display" :value="minAmount"/>
            <ion-button fill="clear" slot="end" @click="increaseAmount('minAmount')">+</ion-button>
          </div>
<!--          Uncomment when client needs it   -->

<!--          <div class="history">-->
<!--            <h3>Historie</h3>-->
<!--            <div class="history-wrapper">-->
<!--              <ul v-if="history" class="history-list">-->
<!--                <li v-for="(item, index) in history" :key="index" class="history-item">-->
<!--                  <p>{{ getActionPrefix(item['aktion']) }}</p>-->
<!--                  <p>{{ formatDate(item['datum']) }}</p>-->
<!--                </li>-->
<!--              </ul>-->
<!--            </div>-->
<!--          </div>-->
          <button class="remove-button" @click="updateArticle">Änderungen speichern</button>
        </ion-card-content>
      </ion-card>
      <div class="managing-buttons">
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

    .history {

      h3 {
        margin: 5px 0 10px 5px;
        font-weight: bold;
      }

      .history-wrapper {
        position: relative;
        max-height: 200px;
        &::before, &::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          height: 20px;
          pointer-events: none;
        }

        &::before {
          top: 0;
          background: linear-gradient(to bottom, white, transparent);
        }

        &::after {
          bottom: 0;
          background: linear-gradient(to top, white, transparent);
        }
        .history-list {
          list-style: none;
          padding: 0;
          margin: 0 0 10px 0;
          max-height: 200px;
          overflow-y: auto;
          position: relative;



          .history-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 5px;
            border-radius: 8px;
            margin-bottom: 5px;

            p {
              margin: 0;
              font-size: 14px;
            }
          }
        }
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
import {onMounted, ref, watch} from 'vue';
import {Article} from "@/interfaces/Article";
import {BASE_URL} from "@/constants";
import ApiService from "@/services/ApiService";
import {IonButton, IonCard, IonCardContent, IonIcon, IonInput, IonModal} from "@ionic/vue";
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
  emits: ['close', 'updateArticle'],
  setup(props, {emit}) {
    const baseUrl = BASE_URL;
    const articleAmount = ref(Number.parseInt(props.article!.amount));
    const minAmount = ref(Number.parseInt(props.article!.minAmount));
    const updatedArticle = ref({...props.article!});
    const history = ref([]);

    watch(() => props.article!, (newArticle) => {
      updatedArticle.value = {...newArticle}
      articleAmount.value = Number.parseInt(newArticle!.amount);
      minAmount.value = Number.parseInt(newArticle!.minAmount);
    });

    const increaseAmount = (type: string) => {
      if (type === 'currentAmount') {
        articleAmount.value++;
      } else if (type === 'minAmount') {
        minAmount.value++;
      }
    };

    const decreaseAmount = (type: string) => {
      if (type === 'currentAmount' && articleAmount.value > 0) {
        articleAmount.value--;
      } else if (type === 'minAmount' && minAmount.value > 0) {
        minAmount.value--;
      }
    };

    const updateArticle = async () => {
      if (articleAmount.value != Number.parseInt(props.article!.amount)) {
        await ApiService.changeAmount(props.article!.articleNumber, articleAmount.value.toString());
      }
      if (minAmount.value != Number.parseInt(props.article!.minAmount)) {
        await ApiService.changeMinAmount(props.article!.articleNumber, minAmount.value.toString());
      }
      updatedArticle.value.amount = articleAmount.value.toString();
      updatedArticle.value.minAmount = minAmount.value.toString();
      const criticalItems = await ApiService.getCriticalItems();
      localStorage.setItem('criticalItems', JSON.stringify(criticalItems.criticalStock));
      emit("updateArticle", updatedArticle.value);
      closeModal();
    };

    // this is needed later
    const fetchHistory = async () => {
      try {
        history.value = await ApiService.getEditHistory(props.article!.articleNumber);
        history.value.sort((a, b) => new Date(b['datum']).getTime() - new Date(a['datum']).getTime());
        console.log(history.value);
      } catch (error) {
        console.error("Error fetching article history:", error);
      }
    };

    const getActionPrefix = (action: string) => {
      return action.split(':')[0];
    }

    const formatDate = (date: string) => {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('de-DE');
    }

    async function openInBrowser() {
      const url = `${baseUrl}index.php?site=articleselection&query=${props.article!.articleNumber}`;
      await Browser.open({url});
    }

    const closeModal = () => {
      emit("close");
    };

    onMounted(() => {
      // Uncomment when client needs it
      //fetchHistory();
    });

    return {
      closeModal,
      formatDate,
      updateArticle,
      openInBrowser,
      increaseAmount,
      decreaseAmount,
      getActionPrefix,
      history,
      baseUrl,
      minAmount,
      articleAmount,
      updatedArticle,
      closeCircle
    }
  }
};
</script>