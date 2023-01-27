<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title>{{ $t("Saved mappings") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="empty-state" v-if="Object.keys(fieldMappings['purchaseOrder']).length == 0">
        <p>{{ $t("No fieldMapping found. Please create new.")}}</p>
      </div>
      <main v-else>
        <section>
          <ion-list>
            <ion-list-header>{{ $t("Mapping") }}</ion-list-header>
            <ion-item v-for="(mapping, index) in fieldMappings['purchaseOrder']" :key="index" @click="viewMappingConfiguration(mapping, index)" detail button>
              <ion-label>{{ mapping.name }}</ion-label>
            </ion-item>
          </ion-list>
        </section>

        <aside class="desktop-only" v-if="isDesktop" v-show="currentMapping.id">
          <MappingConfiguration :mapping="currentMapping"/>
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
    })
  },
   data() {
    return {
      mappingPrefId: '',
      isDesktop: isPlatform('desktop'),
      isMappingConfigAnimationCompleted: false,
      currentMapping: {}
    }
  },
  methods: {
    async viewMappingConfiguration(mapping: any, id: string) {
      this.mappingPrefId = id;
      this.currentMapping = {
        id,
        ...mapping
      }
                                      
      await this.store.dispatch('user/updateCurrentMapping', this.currentMapping);

      // TODO: add support for mobile view
      // if(!this.isDesktop && mapping?.mappingPrefId) {
      //   return;
      // }

      if (this.mappingPrefId && !this.isMappingConfigAnimationCompleted) {
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

.desktop-only {
  display: none;
}

.mobile-only {
  display: unset;
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
    max-width: 50ch;
  }

  .desktop-only {
    display: unset;
  }

  .mobile-only {
    display: none;
  }

  aside {
    width: 0px;
    opacity: 0;
  }
}
</style>
