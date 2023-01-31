<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button default-href="/saved-mappings" slot="start" />
        <ion-title>{{ $t("Mapping details") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <MappingConfiguration />
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonBackButton,
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { useStore } from "vuex";
import MappingConfiguration from '@/components/MappingConfiguration.vue'

export default defineComponent({
  name: 'MappingDetail',
  components: {
    IonBackButton,
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    MappingConfiguration
  },
  mounted() {
    this.store.dispatch('user/updateCurrentMapping', this.$route.params.id)
  },
  setup() {
    const store = useStore();

    return {
      store
    }
  }
});
</script>