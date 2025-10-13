<style scoped>
.example-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>

<template>
  <ion-page>
    <HeaderComponent />
    <ion-content>
      <div class="example-content">This is the Settings page</div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import HeaderComponent from "~/components/HeaderComponent.vue";

export default {
  components: {HeaderComponent, IonContent, IonPage },
};
</script>