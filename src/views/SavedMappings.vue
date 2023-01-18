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
          <!-- Empty state -->
          <div v-if="fieldMappings?.length === 0">
            <p class="ion-text-center">{{ $t("There are no saved mappings right now")}}</p>
          </div>

          <div v-else>
            <ion-item>
              <ion-label>{{ $t("Name") }}</ion-label>
              <ion-input v-model="mappingName" />
            </ion-item>
            <ion-list>
              <ion-item v-for="mapping in fieldMappings" :key="mapping.mappingPrefId" @click="viewMappingConfiguration(mapping)" detail button>
                <ion-label>{{ mapping.mappingPrefName }}</ion-label>
              </ion-item>
            </ion-list>
          </div>
        </section>

        <aside class="desktop-only" v-if="isDesktop" v-show="fieldMappings && Object.keys(fieldMappings).length">
          <MappingConfiguration :fieldMappings="fieldMappings" />
        </aside>
      </main>
    </ion-content>
  </ion-page>      
</template>

<script lang="ts">
import { DateTime } from 'luxon';
import {
  IonContent,
  IonHeader,

  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenuButton,
  IonNote,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
  isPlatform,
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router'
import { mapGetters, useStore } from 'vuex'
import emitter from '@/event-bus';
import MappingConfiguration from '@/components/MappingConfiguration.vue';

export default defineComponent({
  name: 'Miscellaneous',
  components: {
    
  },
  data() {
    return {
      mappingName: "",
      isJobDetailAnimationCompleted: false,
      isDesktop: isPlatform('desktop'),
    }
  },
  computed: {
    ...mapGetters({
      fieldMappings: 'user/getFieldMappings'
    })
  },
  methods: {
    async viewMappingConfiguration(mapping: any) {

      
      // await this.store.dispatch('job/updateCurrentJob', { mapping });
      if(!this.isDesktop && mapping?.mappingPrefId) {
        // this.router.push({name: 'JobDetails', params: { title: this.currentJobTitle, jobId: job?.jobId, category: "miscellaneous"}});
        return;
      }
      if (mapping && !this.isJobDetailAnimationCompleted) {
        emitter.emit('playAnimation');
        this.isJobDetailAnimationCompleted = true;
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
  },
})
</script>