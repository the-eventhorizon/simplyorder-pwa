<template>
  <MainLayout>
    <div class="home-page">
      <h1>Willkommen im Autocolor Inventarsystem</h1>
      <ion-card>
        <ion-card-content>
          <div class="card-header">
            <h2>Bestandsmeldungen</h2>
            <ion-badge color="danger" v-if="Number.parseInt(criticalItems) > 0">{{ criticalItems }}</ion-badge>
          </div>
          <div v-if="Number.parseInt(criticalItems) > 0">
            <div v-for="(article,index) in articles" :key="index" class="stock-critical">
              <div class="list-item" @click="selectArticle(article)">
                <div class="thumbnail" slot="start">
                  <img :src="baseUrl + article.image" :alt="article.articleNumber">
                </div>
                <div class="item-description">
                  <h3>{{ article.description }}</h3>
                  <p>Bestand: <strong>{{ article.amount }}</strong>/{{ article.minAmount }} Mindestbestand</p>
                </div>
                <ion-icon :icon="chevronForward"></ion-icon>
              </div>
            </div>
          </div>
          <div v-else>
            <p class="no-critical-items">Keine Meldungen vorhanden</p>
          </div>
          <button @click="navigateToTab('notifications')" v-if="Number.parseInt(criticalItems) > 3">Alle Meldungen anzeigen</button>
        </ion-card-content>
      </ion-card>
      <div class="action-buttons">
        <button @click="navigateToTab('articles')">Lagerbestand</button>
        <!--<button @click="navigateToTab('bestellungen')">Bestellungen</button>-->
        <button @click="navigateToTab('scanner')" class="scan-article">Artikel scannen</button>
      </div>
    </div>
  </MainLayout>
  <EditArticleModal v-if="selectedArticle" :isOpen="isEditModalOpen" :article="selectedArticle"
                    @close="isEditModalOpen = false" @updateArticle="updateArticle" @openStock="isStockModalOpen = true"
                    @openSuccess="isSuccessModalOpen = true"/>
  <EditSuccessModal v-if="selectedArticle" :isOpen="isSuccessModalOpen" :article="selectedArticle"
                    @close="isSuccessModalOpen = false" @openStock="isStockModalOpen = true"/>
  <StockModal v-if="selectedArticle" :isOpen="isStockModalOpen" :article="selectedArticle"
              @close="isStockModalOpen = false" @updateArticle="updateArticle"
              @openDetails="isDetailsModalOpen = true"/>
  <StockDetailsModal v-if="selectedArticle" :isOpen="isDetailsModalOpen" :article="selectedArticle"
                     @close="isDetailsModalOpen = false" @updateArticle="updateArticle"/>
</template>
<style scoped lang="scss">
.home-page {
  padding: 15px;

  h1 {
    text-align: center;
    text-transform: uppercase;
    font-size: 1.25rem;
    margin-bottom: 20px;
  }

  ion-card {
    margin: 0;

    ion-card-content {
      background-color: #d0deed;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        color: black;
      }

      .stock-critical {
        background: white;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: rgba(0, 0, 0, 0.25) 0 2px 2px 0;
        padding: 10px;

        .list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 5px;
          cursor: pointer;

          .thumbnail {
            width: 50px;
            height: 50px;
            border-radius: 4px;
          }

          .item-description {
            margin-left: 10px;

            h3 {
              font-size: 1rem;
              margin-bottom: 5px;
            }

            p {
              margin: 0;
              font-size: 0.875rem;
            }
          }

          ion-icon {
            color: #f59c00;
            width: 50px;
            height: 50px;
            margin-right: 5px;
          }
        }
      }

      button {
        display: block;
        margin-top: 10px;
        color: #123274;
        background: transparent;
        font-weight: normal;
        font-size: 16px;
        text-decoration: none;
      }

      .no-critical-items {
        text-align: center;
        font-size: 1rem;
        margin-top: 20px;
        color: black;
      }
    }
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-top: 20px;
    gap: 10px;

    button {
      display: block;
      text-align: center;
      background-color: #f59c00;
      color: white;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 10px;
      text-decoration: none;
      font-size: 16px;

      &.scan-article {
        background: white;
        color: black;
        border: 1px solid #f59c00;
        padding: 50px;
      }
    }
  }
}
</style>
<script lang="ts">
import {IonCard, IonCardContent, IonIcon} from '@ionic/vue';
import {chevronForward} from 'ionicons/icons';
import ApiService from "@/services/ApiService";
import {onMounted, ref} from "vue";
import {Article} from "@/interfaces/Article";
import {User} from "@/interfaces/User";
import {BASE_URL} from "@/constants";
import {useRouter} from "vue-router";
import {App as CapacitorApp} from "@capacitor/app";
import MainLayout from "~/layouts/MainLayout.vue";
import EditArticleModal from "~/components/EditArticleModal.vue";
import StockModal from "~/components/StockModal.vue";
import EditSuccessModal from "~/components/EditSuccessModal.vue";
import StockDetailsModal from "~/components/StockDetailsModal.vue";

export default {
  components: {
    StockDetailsModal, EditSuccessModal, StockModal, EditArticleModal,
    MainLayout,
    IonCardContent,
    IonCard,
    IonIcon
  },
  setup() {
    const articles = ref<Article[]>([]);
    const baseUrl = BASE_URL;
    const router = useRouter();
    const user = ref<User>(JSON.parse(localStorage.getItem('userData')!));
    const customerNumber = localStorage.getItem('customerNumber');
    const criticalItems = ref(localStorage.getItem('criticalItems') || '0');
    const selectedArticle = ref<Article | null>(null);
    const isEditModalOpen = ref(false);
    const isSuccessModalOpen = ref(false);
    const isStockModalOpen = ref(false);
    const isDetailsModalOpen = ref(false);

    function loadCriticalsFromStorage() {
      const critical = JSON.parse(localStorage.getItem('criticalArticles')!);
      if (critical) {
        articles.value = critical.slice(0, 3);
      }
    }

    async function fetchArticles() {
      try {
        const allArticles = await ApiService.getArticles();
        const critical = allArticles.filter(article => article.amount <= article.minAmount);
        articles.value = critical.filter(article => article.amount <= article.minAmount).slice(0, 3);
        localStorage.setItem('criticalArticles', JSON.stringify(critical));
      } catch (error) {
        alert((error as Error).message || "An error occurred.")
      }
    }

    const navigateToTab = (tab: string) => {
      router.push({path: `/${tab}`});
    }

    function selectArticle(article: Article) {
      selectedArticle.value = article;
      isEditModalOpen.value = true;
    }

    async function updateArticle(updatedArticle: Article) {
      const index = articles.value.findIndex(article => article.articleNumber === updatedArticle.articleNumber);
      if (index !== -1) {
        articles.value[index] = updatedArticle;
        selectedArticle.value = updatedArticle;
        const number = await ApiService.getCriticalItems();
        localStorage.setItem('criticalItems', JSON.stringify(number.criticalStock));
        criticalItems.value = localStorage.getItem('criticalItems')!;
        await fetchArticles()
      }
    }


    onMounted(() => {
      loadCriticalsFromStorage();
      fetchArticles();

      CapacitorApp.addListener('backButton', () => {
        if (router.currentRoute.value.path === '/home') {
          CapacitorApp.exitApp();
        } else {
          router.back();
        }
      })
    });

    return {
      selectArticle,
      updateArticle,
      navigateToTab,
      user,
      baseUrl,
      articles,
      criticalItems,
      selectedArticle,
      isEditModalOpen,
      isStockModalOpen,
      isSuccessModalOpen,
      isDetailsModalOpen,
      chevronForward
    }
  }
};
</script>