<template>
  <MainLayout>
    <div class="request">
      <div class="header">
        <ion-icon :icon="chevronBackOutline" @click="$router.back()"></ion-icon>
        <h1>Anfragen</h1>
      </div>
      <div class="new-request">
        <button @click="isNewRequestModalOpen = true">Neue Anfrage stellen</button>
      </div>
      <div class="request-list-card">
        <p class="list-header">Vergangene Anfragen</p>
        <ul v-if="requests" class="request-list">
          <li class="list-item" v-for="request in requests" :key="request.id">
            <div class="row">
              <div class="item-content" @click="openRequestDetails(request)">
                <p class="request-id">ID: {{ request.id }}</p>
                <p class="request-text">{{ request.text }}</p>
              </div>
              <ion-icon :icon="chevronForward"></ion-icon>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </MainLayout>
  <RequestDetailsModal v-if="isRequestModalOpen" :isOpen="isRequestModalOpen" :request="selectedRequest" @close="isRequestModalOpen = false" />
  <NewRequestModal v-if="isNewRequestModalOpen" :isOpen="isNewRequestModalOpen" @close="isNewRequestModalOpen = false" @updateRequests="fetchRequests"/>
</template>

<style scoped>
.request {
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

  .new-request {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 0 20px 20px 20px;

    button {
      background: #f59c00;
      color: white;
      border-radius: 8px;
      font-size: 16px;
      padding: 16px;
      width: 100%;
    }
  }

  .request-list-card {
    background: #d0deed;
    margin: 0 20px;
    border-radius: 8px;
    .list-header {
      padding: 20px 0 0 10px;
      margin: 0;
    }

    .request-list {
      height: fit-content;
      overflow: auto;
      padding: 0;
      margin: 0;

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


          .item-content {
            cursor: pointer;
            width: 100%;
            padding: 10px;

            .request-id {
              font-weight: bold;
              color: #333;
              margin: 0 0 5px 0;
            }

            .request-text {
              color: #666;
              margin: 0;
            }
          }
          ion-icon {
            color: #f59c00;
            width: 30px;
            height: 30px;
            margin-left: auto;
            cursor: pointer;
          }
        }
      }
    }
  }
}
</style>
<script lang="ts">
import MainLayout from './layouts/MainLayout.vue';
import ApiService from '@/services/ApiService';
import {IonIcon} from '@ionic/vue';
import {chevronBackOutline, chevronForward} from "ionicons/icons";
import {ref, onMounted} from 'vue';
import {Request} from '@/interfaces/Request';
import RequestDetailsModal from '~/components/RequestDetailsModal.vue';
import NewRequestModal from '~/components/NewRequestModal.vue';

export default {
  components: {
    MainLayout, IonIcon, RequestDetailsModal, NewRequestModal
  },
  setup() {
    const requests = ref<Request[]>([]);
    const isRequestModalOpen = ref(false);
    const isNewRequestModalOpen = ref(false);
    const selectedRequest = ref<Request | null>(null);
    const customerNumber = localStorage.getItem('customerNumber');


    function loadRequestsFromStorage() {
      const storedRequests = localStorage.getItem('requests');
      if (storedRequests) {
        requests.value = JSON.parse(storedRequests);
      }
    }

    async function fetchRequests() {
      const result = await ApiService.getRequests();
      requests.value = result;
      localStorage.setItem('requests', JSON.stringify(result));
    }

    function openRequestDetails(request: Request) {
      selectedRequest.value = request;
      isRequestModalOpen.value = true;
    }

    onMounted(() => {
      loadRequestsFromStorage();
      fetchRequests();
    })

    return {
      chevronForward,
      chevronBackOutline,
      requests,
      selectedRequest,
      isRequestModalOpen,
      isNewRequestModalOpen,
      openRequestDetails,
      fetchRequests
    };
  },
}
</script>