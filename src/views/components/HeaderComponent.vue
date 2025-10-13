<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>
        <div class="header-logo">
          <img src="@/assets/images/logo-autocolor.png" alt="logo.png">
        </div>
      </ion-title>
    </ion-toolbar>
  </ion-header>
</template>
<style scoped lang="scss">
ion-toolbar {
  --background: linear-gradient(#123274, #006eb8);

  .header-logo {
    display: flex;
    justify-content: center;
    img {
      width: 100px;
      height: auto;
    }
  }
}
</style>
<script setup lang="ts">
import {IonHeader, IonTitle, IonToolbar} from "@ionic/vue";
</script>