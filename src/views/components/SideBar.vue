<template>
  <ion-menu side="end" menu-id="sidebar-menu" content-id="page-content">
    <div class="menu">
      <div class="title" @click="closeSidebar">
        <img src="@/assets/images/logo-autocolor.png" alt="logo.png">
      </div>
      <div class="separator"></div>
      <div class="link-list">
        <button class="sidebar-button" @click="navigateToTab('articles')">
          <span>Lagerbestand</span>
        </button>
        <button class="sidebar-button" @click="openInDefaultBrowser()">
          <span>Shop</span>
        </button>
<!--        <button class="sidebar-button" @click="navigateToTab('request')">-->
<!--          <span>Anfrage</span>-->
<!--        </button>-->
        <button class="sidebar-button scan-article" @click="navigateToTab('scanner')">
          <span>Artikel scannen</span>
        </button>
        <div class="separator"></div>
        <button class="sidebar-button" @click="logout">
          <span>Ausloggen</span>
        </button>
      </div>
      <div class="legal-links">
        <a href="https://autocolor-zentrum.de/impressum" target="_blank">Impressum</a>
        <a href="https://autocolor-zentrum.de/datenschutz" target="_blank">Datenschutz</a>
      </div>
    </div>
  </ion-menu>
</template>

<style scoped lang="scss">
.menu {
  background: linear-gradient(#123274, #006fb9);
  height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  .title {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 30px 0;
    height: 60px;
    color: white;

    img {
      width: 100%;
      max-width: 200px;
      height: auto;
    }
  }
  .separator {
    width: 85%;
    height: 5px;
    background: #f59c00;
  }
  .link-list {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    align-items: center;
    gap: 15px;
    width: 100%;
    padding: 20px 0;

    .sidebar-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 85%;
      padding: 16px;
      color: white;
      text-decoration: none;
      font-size: 16px;
      background: #f59c00;
      border: none;
      border-radius: 8px;
      cursor: pointer;

      &.scan-article {
        background: white;
        color: black;
        border: 1px solid #f59c00;
        width: calc(85% - 2px);
      }
    }
  }
  .legal-links {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 20px;
    height: 15%;
    width: 85%;
    text-align: end;
    a {
      color: white;
      text-decoration: none;
      font-size: 16px;
    }
  }
}
</style>

<script lang="ts">
import {IonMenu} from "@ionic/vue";
import {
  informationCircleOutline,
  menuOutline,
  cogOutline,
  homeOutline,
  closeOutline,
  qrCodeOutline,
  logOutOutline, cartOutline
} from "ionicons/icons";
import {closeSidebar, isMobile} from "@/sidebar";
import ApiService from "@/services/ApiService";
import {useRouter} from "vue-router";
import {Browser} from "@capacitor/browser";
import {BASE_URL} from "@/constants";


export default {

  components: {
    IonMenu,
  },

  setup() {
    const router = useRouter();
    const baseUrl = BASE_URL;
    async function logout() {
      await ApiService.logout()
      await closeSidebar()
      await router.push("/login");
    }

    async function openInDefaultBrowser() {
      await Browser.open({url: baseUrl})
    }

    const navigateToTab = (tab: string) => {
      router.push({path: `/${tab}`});
      closeSidebar();
    }

    return {
      logout,
      closeSidebar,
      navigateToTab,
      openInDefaultBrowser,
      isMobile,
      cogOutline,
      menuOutline,
      cartOutline,
      homeOutline,
      closeOutline,
      logOutOutline,
      qrCodeOutline,
      informationCircleOutline
    }
  }
}
</script>