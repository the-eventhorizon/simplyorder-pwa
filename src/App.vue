<template>
  <ion-app>
    <ion-router-outlet :key="$route.fullPath" />
  </ion-app>
</template>
<style scoped>
ion-app {
  overflow: hidden;
}
</style>
<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';

</script>
