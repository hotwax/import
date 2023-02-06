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
        <div class="empty-state" v-if="!areFieldMappingsAvailable">
          <p>{{ $t("No field mapping found. Please create new.")}}</p>
        </div>
        <section v-else>
          <ion-list>
            <ion-list-header>{{ $t("Purchase order") }}</ion-list-header>
            <ion-item v-for="(mapping, index) in fieldMappings('purchaseOrder')" :key="index" @click="viewMappingConfiguration(index, 'purchaseOrder')" detail button>
              <ion-label>{{ mapping.name }}</ion-label>
            </ion-item>
          </ion-list>
          <ion-list>
            <ion-list-header>{{ $t("Inventory") }}</ion-list-header>
            <ion-item v-for="(mapping, index) in fieldMappings('inventory')" :key="index" @click="viewMappingConfiguration(index, 'inventory')" detail button>
              <ion-label>{{ mapping.name }}</ion-label>
            </ion-item>
          </ion-list>
        </section>

        <aside class="desktop-only" v-if="isDesktop" v-show="currentMappingId">
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
  computed: {
    ...mapGetters({
      fieldMappings: 'user/getFieldMappings'
    }),
    areFieldMappingsAvailable() {
      // using below logic to check mappings as we are storing mappings as objects of objects of object
      return Object.values((this as any).fieldMappings()).some((mappings: any) => Object.keys(mappings).length)
    }
  },
  data() {
    return {
      isDesktop: isPlatform('desktop'),
      isMappingConfigAnimationCompleted: false,
      currentMappingId: ''
    }
  },
  methods: {
    async viewMappingConfiguration(id: string, mappingType: string) {
      this.currentMappingId = id
      await this.store.dispatch('user/updateCurrentMapping', { id, mappingType });

      if(!this.isDesktop && id) {
        this.router.push({name: 'MappingDetail', params: { mappingType, id }});
        return;
      }

      if (id && !this.isMappingConfigAnimationCompleted) {
        emitter.emit('playAnimation');
        this.isMappingConfigAnimationCompleted = true;
      }
    }
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    return {
      router,
      store,
    };
  }
})
</script>

<style scoped>
aside {
  flex: 1 0 355px;
  position: sticky;
  top: var(--spacer-lg);
  flex: 1;
}

@media (min-width: 991px) {
  main {
    display: flex;
    justify-content: center;
    align-items: start;
    gap: var(--spacer-2xl);
    max-width: 990px;
    margin: var(--spacer-base) auto 0;
  }

  main > section {
    width: 50ch;
  }

  aside {
    width: 0px;
    opacity: 0;
  }
}
</style>