<template>
  <ion-tabs>
    <ion-router-outlet></ion-router-outlet>
    <ion-tab-bar slot="bottom">
      <ion-tab-button tab="home" href="/home">
        <ion-icon :icon="home"></ion-icon>
      </ion-tab-button>
      <ion-tab-button tab="notifications" href="/notifications">
        <ion-icon :icon="notifications"></ion-icon>
        <ion-badge class="critical-items" color="danger" v-if="criticalItems > 0">{{ criticalItems < 100 ? criticalItems : '99+'}}</ion-badge>
      </ion-tab-button>
      <ion-tab-button tab="settings" href="/settings">
        <ion-icon :icon="person"></ion-icon>
      </ion-tab-button>
      <ion-tab-button @click="openSidebar">
        <ion-icon :icon="menuOutline"></ion-icon>
      </ion-tab-button>
    </ion-tab-bar>
  </ion-tabs>
</template>
<style scoped>
.critical-items {
  font-size: 12px;
  padding: 4px;
}
ion-tab-bar {
  --background: linear-gradient(#123274, #006eb8);
  --color-selected: #006eb8;
}
ion-icon {
  color: white;
}
.tab-selected {
  --background: linear-gradient(#006eb8, #123274);
}
</style>
<script lang="ts">
import { IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonBadge } from "@ionic/vue";
import {notifications, menuOutline, person, home, closeOutline} from "ionicons/icons";
import {openSidebar, isMobile} from "@/sidebar";


export default {
  components: {
    IonTabs,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonBadge
  },

  setup() {
    const criticalItems = Number.parseInt(localStorage.getItem('criticalItems')!) || 0;
    return {
      openSidebar,
      criticalItems,
      isMobile,
      home,
      menuOutline,
      closeOutline,
      person,
      notifications
    }
  }
}
</script>