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
          <div class="empty-state" v-if="Object.keys(fieldMappings).length == 0">
            <p>{{ $t("No field mapping found. Please create new.")}}</p>
          </div>
          <ion-list v-else>
            <ion-list-header>{{ $t("Mapping") }}</ion-list-header>
            <ion-item v-for="(mapping, index) in fieldMappings" :key="index" @click="viewMappingConfiguration(mapping, index)" detail button>
              <ion-label>{{ mapping.name }}</ion-label>
            </ion-item>
          </ion-list>
        </section>

        <aside class="desktop-only" v-if="isDesktop" v-show="currentMapping.id">
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
                                      
      await this.store.dispatch('user/updateCurrentMapping', id);

      if(!this.isDesktop && id) {
        this.router.push({name: 'MappingDetail', params: { id: this.mappingPrefId }});
        return;
      }

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
