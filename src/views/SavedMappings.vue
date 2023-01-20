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
            <ion-item v-for="mapping in fieldMappings" :key="mapping.mappingPrefId" @click="viewMappingConfiguration(mapping)" detail button>
              <ion-label>{{ mapping.mappingPrefName }}</ion-label>
            </ion-item>
          </ion-list>
        </section>

        <aside class="desktop-only" v-if="isDesktop" v-show="currentMapping">
          <MappingConfiguration />
        </aside>
      </main>
    </ion-content>
  </ion-page>      
</template>

<script lang="ts">
import { DateTime } from 'luxon';
import {
  IonContent,
  IonItem,
  IonLabel,
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
      mappingName: "",
      isJobDetailAnimationCompleted: false,
      isDesktop: isPlatform('desktop'),
    }
  },
  computed: {
    ...mapGetters({
      fieldMappings: 'user/getFieldMappings',
      currentMapping: 'user/getCurrentMapping'
    })
  },
  methods: {
    async viewMappingConfiguration(mapping: any) {
      await this.store.dispatch('user/updateCurrentMapping', { mapping });
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

<style scoped>

@media (min-width: 991px) {
  main {
    display: flex;
    justify-content: center;
    align-items: start;
    max-width: 990px;
    margin: var(--spacer-base) auto 0;
  }

  main > section {
    width: 50ch;
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