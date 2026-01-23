<template>
  <MainLayout>
    <div class="example-content">
      <div class="critical">
        <div class="header">
          <ion-icon :icon="chevronBackOutline" slot="start" @click="$router.back()"></ion-icon>
          <h2>Mindesbestandsmeldungen</h2>
        </div>
        <div class="article-list-card">
          <ul v-if="articles.length > 0" class="article-list">
            <li v-for="article in articles" :key="article.articleNumber" class="list-item">
              <div class="row">
                <div class="thumbnail">
                  <img :src="baseUrl + article.image" :alt="article.articleNumber">
                </div>
                <div class="item-content" @click="selectArticle(article)">
                  <p class="item-description">{{ article.description }}</p>
                  <div class="item-details">
                    <p class="item-amount">Bestand: {{ article.amount }}/{{ article.minAmount }}</p>
                    <p v-if="canViewPrices" class="item-price">Preis:
                      {{ Number.parseFloat(article.price).toFixed(2).replace('.', ',') }} €</p>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="action-buttons">
                  <button @click="openInDefaultBrowser(article)">Jetzt Nachbestellen</button>
                </div>
              </div>
            </li>
          </ul>
        </div>
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
<style scoped>
.critical {
  .header {
    display: flex;
    align-items: center;
    padding: 10px;
    justify-content: center;

    ion-icon {
      position: absolute;
      left: 10px;
      width: 30px;
      height: 30px;
      color: #f59c00;
      cursor: pointer;
    }
  }

  .article-list-card {
    background: #d0deed;
    margin: 0 20px;
    border-radius: 8px;

    .article-list {
      height: fit-content;
      overflow: auto;
      padding: 0;

      .list-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 10px;
        margin: 10px;
        background: white;
        border-radius: 8px;

        .row {
          display: flex;
          flex-direction: row;
          align-items: center;
          width: 100%;
        }

        .thumbnail {
          width: 50px;
          height: 50px;
          display: flex;
          border-radius: 4px;
          justify-content: center;
          overflow: hidden;

          img {
            width: auto;
            height: 100%;
            border-radius: 4px;
          }
        }

        .item-content {
          margin-left: 20px;
          cursor: pointer;

          p {
            margin: 0;
            font-size: 0.875rem;

            &.item-description {
              font-size: 16px;
              margin-bottom: 10px;
            }
          }

          .item-details {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            margin-top: 5px;

            .item-amount {
              font-size: 14px;
              color: #555;
            }

            .item-price {
              font-size: 14px;
              color: #555;
            }
          }
        }

        .action-buttons {
          display: flex;
          width: 100%;
          justify-content: space-between;
          margin-top: 20px;
          gap: 10px;

          button {
            width: 100%;
            text-align: center;
            background-color: #f59c00;
            color: white;
            padding: 16px;
            font-size: 16px;
            border-radius: 8px;
            margin-bottom: 10px;
            text-decoration: none;
          }
        }
      }
    }
  }
}
</style>
<script lang="ts">
import MainLayout from "~/layouts/MainLayout.vue";
import {chevronBackOutline, chevronForwardOutline} from "ionicons/icons";
import {IonIcon} from "@ionic/vue";
import {ref, onMounted} from "vue";
import {Article} from "@/interfaces/Article";
import ApiService from "@/services/ApiService";
import {BASE_URL} from "@/constants";
import {Browser} from "@capacitor/browser";
import EditArticleModal from "~/components/EditArticleModal.vue";
import StockModal from "~/components/StockModal.vue";
import EditSuccessModal from "~/components/EditSuccessModal.vue";
import StockDetailsModal from "~/components/StockDetailsModal.vue";

export default {
  components: {StockDetailsModal, EditSuccessModal, StockModal, EditArticleModal, MainLayout, IonIcon},
  setup() {
    const articles = ref<Article[]>([]);
    const baseUrl = BASE_URL;
    const isEditModalOpen = ref(false);
    const isStockModalOpen = ref(false);
    const isSuccessModalOpen = ref(false);
    const isDetailsModalOpen = ref(false);
    const selectedArticle = ref<Article | null>(null);
    const criticalItems = ref(localStorage.getItem('criticalItems') || '0');
    const customerNumber = localStorage.getItem('customerNumber');
    const canViewPrices = JSON.parse(localStorage.getItem('userRights')!).some((right: any) => right.id === 17);

    function loadCriticalArticlesFromStorage() {
      const criticalArticles = localStorage.getItem('criticalArticles');
      if (criticalArticles) {
        articles.value = JSON.parse(criticalArticles);
      }
    }

    async function fetchArticles() {
      try {
        const allArticles = await ApiService.getArticles();
        articles.value = allArticles.filter(article => article.amount <= article.minAmount);
        localStorage.setItem('criticalArticles', JSON.stringify(articles.value));
      } catch (error) {
        alert((error as Error).message || "Ein Fehler ist aufgetreten.");
      }
    }

    async function openInDefaultBrowser(article: Article) {
      const url = baseUrl + '/index.php?site=articleselection&query=' + article.articleNumber;
      await Browser.open({url});
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
        const number = await ApiService.getCriticalItems(customerNumber!);
        localStorage.setItem('criticalItems', JSON.stringify(number.criticalStock));
        criticalItems.value = localStorage.getItem('criticalItems')!;
        await fetchArticles()
      }
    }

    onMounted(() => {
      loadCriticalArticlesFromStorage();
      fetchArticles()
    });

    return {
      selectArticle,
      updateArticle,
      openInDefaultBrowser,
      baseUrl,
      articles,
      canViewPrices,
      selectedArticle,
      isEditModalOpen,
      isStockModalOpen,
      isSuccessModalOpen,
      isDetailsModalOpen,
      chevronBackOutline,
      chevronForwardOutline,
    }
  }
}
</script>