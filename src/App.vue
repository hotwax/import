<template>
  <IonApp>
    <IonSplitPane content-id="main-content" when="lg">
      <Menu />
      <ion-router-outlet id="main-content"></ion-router-outlet>
    </IonSplitPane>
  </IonApp>
</template>

<script lang="ts">
import Menu from '@/components/Menu.vue';
import { IonApp, IonRouterOutlet, IonSplitPane, loadingController } from '@ionic/vue';
import { defineComponent } from 'vue';
import emitter from "@/event-bus"
import { mapGetters, useStore } from 'vuex';
import { init, resetConfig } from '@/adapter'
import { showToast } from "@/utils";
import { translate } from "@/i18n";

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet,
    IonSplitPane,
    Menu
  },
  data() {
    return {
      loader: null as any,
      maxAge: process.env.VUE_APP_CACHE_MAX_AGE ? parseInt(process.env.VUE_APP_CACHE_MAX_AGE) : 0,
      refreshing: false,
      registration: null,
      updateExists: false,
    }
  },
  methods: {
    async presentLoader() {
      if (!this.loader) {
        this.loader = await loadingController
          .create({
            message: this.$t("Click the backdrop to dismiss."),
            translucent: true,
            backdropDismiss: true
          });
      }
      this.loader.present();
    },
    dismissLoader() {
      if (this.loader) {
        this.loader.dismiss();
        this.loader = null as any;
      }
    },
    updateAvailable($event: any) {
      this.registration = $event.detail;
      this.updateExists = true;
      this.store.dispatch('user/updatePwaRegistration', this.registration);
      this.store.dispatch('user/updatePwaUpdateState', this.updateExists);
      showToast(translate("New version available, please update the app."));
    },
  },
  async mounted() {
    this.loader = await loadingController
      .create({
        message: this.$t("Click the backdrop to dismiss."),
        translucent: true,
        backdropDismiss: true
      });
    emitter.on('presentLoader', this.presentLoader);
    emitter.on('dismissLoader', this.dismissLoader);

    init(this.userToken, this.instanceUrl, this.maxAge)
  },
  created() {
    document.addEventListener('swUpdated', this.updateAvailable, { once: true })
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (this.refreshing) return
      this.refreshing = true
      window.location.reload()
    })
  },
  unmounted() {
    emitter.off('presentLoader', this.presentLoader);
    emitter.off('dismissLoader', this.dismissLoader);
    resetConfig()
  },
  computed: {
    ...mapGetters({
      userToken: 'user/getUserToken',
      instanceUrl: 'user/getInstanceUrl'
    })
  },
  setup(){
    const store = useStore();
    return {
      store,
    }
  },
});
</script>