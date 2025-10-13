<template>
  <SideBar/>
  <ion-page id="page-content">
    <!--    Sidebar (permanently on the left for desktop; hidden, opens from right for mobile    -->
    <!--      Tabs      -->
    <div id="main-content">
      <TabBar/>
    </div>
  </ion-page>
</template>

<style scoped>
</style>

<script lang="ts">
import {IonPage} from "@ionic/vue";
import {informationCircleOutline, menuOutline, cogOutline, homeOutline, closeOutline} from "ionicons/icons";
import TabBar from "~/components/TabBar.vue";
import {isMobile} from "@/sidebar";
import SideBar from "~/components/SideBar.vue";
import {onMounted} from "vue";
import ApiService from "@/services/ApiService";
import {BASE_URL} from "@/constants";
import {App as CapacitorApp} from "@capacitor/app";


export default {
  components: {
    SideBar,
    TabBar,
    IonPage,
  },

  setup() {

    async function initializeApp() {
      const customerNumber = localStorage.getItem('customerNumber');
      try {
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Operation timed out')), 5000) // 5000ms timeout
        );


        const criticalItemsPromise = ApiService.getCriticalItems(customerNumber!);
        const number = await Promise.race([criticalItemsPromise, timeout]);
        localStorage.setItem('criticalItems', JSON.stringify(number.criticalStock));
        if (!localStorage.getItem('filters') || !localStorage.getItem('types')) {
          const filtersAndTypesPromise = ApiService.getFiltersAndTypes(customerNumber!);
          const result = await Promise.race([filtersAndTypesPromise, timeout]);

          const filters = result.filters;
          const types = result.types;
          localStorage.setItem('filters', JSON.stringify(filters));
          localStorage.setItem('types', JSON.stringify(types));
        }
      } catch (error) {
        console.error('Error connecting to the server:', error);
        alert(`Bei der Verbindung zum Server ist ein Fehler (${BASE_URL}) aufgetreten. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut. ${error}`);
        await CapacitorApp.exitApp();
      }
    }

    onMounted(() => {
      initializeApp();
    })

    return {
      isMobile,
      cogOutline,
      homeOutline,
      menuOutline,
      closeOutline,
      informationCircleOutline
    }
  }
}

</script>