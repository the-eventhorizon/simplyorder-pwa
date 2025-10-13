<template>
  <MainLayout>
    <div class="example-content">
      <div class="inventory">
        <div class="header">
          <ion-icon :icon="chevronBackOutline" slot="start" @click="$router.back()"></ion-icon>
          <h2>Lagerbestand</h2>
        </div>
        <div class="filters">
          <input type="text" placeholder="Suchbegriff" v-model="searchTerm" @input="searchArticles">
          <select v-model="selectedFilter" @change="filterArticles">
            <option value="">Filter auswählen</option>
            <option v-for="filter in filters" :key="filter.filter" :value="filter.filter">
              {{ filter.filter.replace(/ae/g, 'ä').replace(/oe/g, 'ö').replace(/ue/g, 'ü') }}
            </option>
          </select>
          <div class="category-buttons">
            <button v-for="category in categories"
                    :key="category.type"
                    :ref="el => buttonRefs[category.type] = el"
                    @click="filterByCategory(category.type)"
                    :class="{ active: activeButton === category.type }">
              {{ category.type.replace(/ae/g, 'ä').replace(/oe/g, 'ö').replace(/ue/g, 'ü') }}
            </button>
          </div>
        </div>
        <div class="article-list-card">
          <ul v-if="articles.length  > 0" class="article-list">
            <li v-for="article in filteredArticles" :key="article.articleNumber" @click="selectArticle(article)"
                class="list-item">
              <div class="thumbnail">
                <img :src="baseUrl + article.image" :alt="article.articleNumber">
              </div>
              <div class="item-content">
                <p class="item-description">{{ article.description }}</p>
                <div class="item-details">
                  <span>Bestand: {{ article.amount }}/{{ article.minAmount }}</span>
                  <span class="item-price" v-show="canViewPrices">
                  Preis: {{ Number.parseFloat(article.price).toFixed(2).replace('.', ',') }}€
                </span>
                </div>
              </div>
              <ion-icon :icon="chevronForwardOutline"></ion-icon>
            </li>
          </ul>
          <p v-else class="no-articles">Keine Artikel gefunden</p>
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
.inventory {

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

  .filters {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin: 10px;

    input {
      padding: 10px;
      border-radius: 5px;
      border: 1px solid #ccc;
      margin-bottom: 10px;
      background: white;
    }

    select {
      padding: 10px;
      border-radius: 5px;
      border: 1px solid #ccc;
      background: white;
      margin-bottom: 10px;
    }

    .category-buttons {
      display: flex;
      overflow-x: auto;
      gap: 5px;

      button {
        padding: 10px;
        border-radius: 5px;
        border: 1px solid #f59c00;
        background: white;
        color: #f59c00;

        &.active {
          background: #f59c00;
          color: white;
        }
      }
    }
  }

  .article-list-card {
    background: #d0deed;
    margin: 20px;
    border-radius: 8px;

    .article-list {
      height: fit-content;
      padding: 1px 0;

      .list-item {
        display: flex;
        align-items: center;
        padding: 10px;
        cursor: pointer;
        margin: 10px;
        background: white;
        border-radius: 8px;

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
          width: 100%;

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
            justify-content: space-between;
            align-items: center;
            margin-top: 5px;

            span {
              font-size: 14px;
              color: #555;

              &.item-price {
                margin-right: 10px;
              }
            }
          }
        }

        ion-icon {
          color: #f59c00;
          width: 30px;
          height: 30px;
          margin-left: auto;
        }
      }
    }
    .no-articles {
      text-align: center;
      font-size: 1rem;
      color: black;
      margin: 20px;
    }
  }
}
</style>
<script lang="ts">
import {IonIcon} from '@ionic/vue';
import {chevronForwardOutline, chevronBackOutline} from 'ionicons/icons';
import ApiService from "@/services/ApiService";
import {ComponentPublicInstance, onMounted, ref} from "vue";
import {Article} from "@/interfaces/Article";
import {BASE_URL} from "@/constants";
import MainLayout from "~/layouts/MainLayout.vue";
import EditArticleModal from "~/components/EditArticleModal.vue";
import EditSuccessModal from "~/components/EditSuccessModal.vue";
import StockModal from "~/components/StockModal.vue";
import StockDetailsModal from "~/components/StockDetailsModal.vue";

export default {
  components: {
    StockDetailsModal,
    StockModal,
    EditSuccessModal,
    EditArticleModal,
    MainLayout, IonIcon
  },
  setup() {
    const articles = ref<Article[]>([]);
    const filteredArticles = ref<Article[]>([]);
    const baseUrl = BASE_URL;
    const isEditModalOpen = ref(false);
    const isSuccessModalOpen = ref(false);
    const isStockModalOpen = ref(false);
    const isDetailsModalOpen = ref(false);
    const selectedArticle = ref<Article | null>(null);
    const filters = JSON.parse(localStorage.getItem('filters')!);
    const categories = ref(JSON.parse(localStorage.getItem('types')!));
    const buttonRefs = ref<{ [key: string]: Element | ComponentPublicInstance | null }>({});
    const activeButton = ref<string | null>(null);
    const searchTerm = ref<string>('');
    const selectedFilter = ref<string | null>('');
    const canViewPrices = JSON.parse(localStorage.getItem('userRights')!).some((right: any) => right.id === 17);

    function loadArticlesFromLocalStorage() {
      const storedArticles = localStorage.getItem('articles');
      if (storedArticles) {
        articles.value = JSON.parse(storedArticles);
        filteredArticles.value = articles.value;
      }
    }

    async function fetchArticles() {
      try {
        const fetchedArticles = await ApiService.getArticles();
        articles.value = fetchedArticles;
        filteredArticles.value = articles.value;
        localStorage.setItem('articles', JSON.stringify(fetchedArticles));
      } catch (error) {
        alert((error as Error).message || "Ein Fehler ist aufgetreten.");
      }
    }

    function updateArticle(updatedArticle: Article) {
      const index = articles.value.findIndex(article => article.articleNumber === updatedArticle.articleNumber);
      if (index !== -1) {
        articles.value[index] = updatedArticle;
        selectedArticle.value = updatedArticle;
      }
    }

    function selectArticle(article: Article) {
      selectedArticle.value = article;
      isEditModalOpen.value = true;
    }

    function searchArticles() {
      if (!searchTerm.value) {
        filteredArticles.value = articles.value;
      } else {
        filteredArticles.value = articles.value.filter(
            article => article.description.toLowerCase().includes(searchTerm.value.toLowerCase())
                || article.articleNumber.toLowerCase().includes(searchTerm.value.toLowerCase()));
      }
    }

    function filterArticles() {
      if (!selectedFilter.value) {
        filteredArticles.value = articles.value;
        return;
      }
      filteredArticles.value = articles.value.filter(
          article => article.filter === selectedFilter.value
      )
    }

    function filterByCategory(type: string) {
      // if active button is clicked again, reset the filter
      if (activeButton.value === type) {
        activeButton.value = null;
        filteredArticles.value = articles.value;
        return;
      }
      activeButton.value = activeButton.value === type ? null : type;
      filteredArticles.value = articles.value.filter(article => article.category === type);
    }

    onMounted(() => {
      loadArticlesFromLocalStorage();
      fetchArticles();
    });

    return {
      selectArticle,
      updateArticle,
      searchArticles,
      filterArticles,
      filterByCategory,
      baseUrl,
      filters,
      articles,
      categories,
      buttonRefs,
      searchTerm,
      activeButton,
      canViewPrices,
      selectedFilter,
      isEditModalOpen,
      selectedArticle,
      filteredArticles,
      isStockModalOpen,
      isSuccessModalOpen,
      isDetailsModalOpen,
      chevronBackOutline,
      chevronForwardOutline,
    }
  }
};
</script>