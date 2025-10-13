<template>
  <ion-page>
    <HeaderComponent/>
    <ion-content>
      <slot/>
    </ion-content>
  </ion-page>
</template>

<style scoped>
</style>

<script setup lang="ts">
import HeaderComponent from "~/components/HeaderComponent.vue";
import {IonContent, IonPage} from "@ionic/vue";
</script>