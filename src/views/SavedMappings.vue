<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title>{{ $t("Saved mappings") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main>
        <section>
          <ion-list>
            <ion-list-header>{{ $t("Mapping") }}</ion-list-header>
            <ion-item detail button>
              <ion-label>{{ 'First' }}</ion-label>
            </ion-item>
            <ion-item detail button>
              <ion-label>{{ 'Second' }}</ion-label>
            </ion-item>
          </ion-list>
        </section>

        <aside class="desktop-only">
          <MappingConfiguration />
        </aside>
      </main>
    </ion-content>
  </ion-page>      
</template>

<script lang="ts">
import {
  IonContent,
  IonItem,
  IonLabel,
  IonListHeader,
  IonMenuButton,
  IonList,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonPage,
  isPlatform,
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router'
import { mapGetters, useStore } from 'vuex'
import emitter from '@/event-bus';
import MappingConfiguration from '@/components/MappingConfiguration.vue'

export default defineComponent({
  name: 'SavedMappings',
  components: {
    IonContent,
    IonItem,
    IonLabel,
    IonListHeader,
    IonMenuButton,
    IonList,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonPage,
    MappingConfiguration
  },
  data() {
    return {
    }
  }
})
</script>
