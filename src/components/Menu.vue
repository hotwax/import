<template>
  <ion-menu content-id="main-content" type="overlay" :disabled="!isUserAuthenticated">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ translate("Import")}}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list id="import-list">
        <ion-menu-toggle auto-hide="false" v-for="(p, i) in appPages" :key="i">
          <ion-item
            button
            router-direction="root"
            :router-link="p.url"
            class="hydrated"
            :class="{ selected: selectedIndex === i }">
            <ion-icon slot="start" :ios="p.iosIcon" :md="p.mdIcon"></ion-icon>
            <ion-label>{{ p.title }}</ion-label>
          </ion-item>
        </ion-menu-toggle>
      </ion-list>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-item lines="none">
          <ion-label class="ion-text-wrap">
            <p class="overline">{{ instanceUrl }}</p>
          </ion-label>
          <ion-note slot="end">{{ userProfile?.userTimeZone }}</ion-note>
        </ion-item>
      </ion-toolbar>
    </ion-footer>
  </ion-menu>
</template>

<script lang="ts">
import {
  IonContent,
  IonFooter,
  IonIcon,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonNote,
  IonTitle,
  IonToolbar,
} from "@ionic/vue";
import { computed, defineComponent } from "vue";
import { mapGetters } from "vuex";
import { albumsOutline, bookmarkOutline, settings, calendar } from "ionicons/icons";
import { useStore } from "@/store";
import { useRouter } from "vue-router";
import { translate } from '@hotwax/dxp-components'

export default defineComponent({
  name: "Menu",
  components: {
    IonContent,
    IonFooter,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonMenu,
    IonMenuToggle,
    IonNote,
    IonTitle,
    IonToolbar    
  },
  computed: {
    ...mapGetters({
      isUserAuthenticated: 'user/isUserAuthenticated',
      instanceUrl: 'user/getInstanceUrl',
      userProfile: 'user/getUserProfile'
    })
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const appPages = [
      {
        title: "Inventory",
        url: "/inventory",
        childRoutes: ["/inventory-review"],
        iosIcon: albumsOutline,
        mdIcon: albumsOutline
      },
      {
        title: "Purchase order",
        url: "/purchase-order",
        childRoutes: ["/purchase-order-review"],
        iosIcon: calendar,
        mdIcon: calendar
      },
      {
        title: "Saved Mappings",
        url: "/saved-mappings",
        childRoutes: ["/mapping/"],
        iosIcon: bookmarkOutline,
        mdIcon: bookmarkOutline
      },
      {
        title: "Settings",
        url: "/settings",
        iosIcon: settings,
        mdIcon: settings,
      }
    ];

    const selectedIndex = computed(() => {
      const path = router.currentRoute.value.path
      return appPages.findIndex((screen) => screen.url === path || screen.childRoutes?.includes(path) || screen.childRoutes?.some((route) => path.includes(route)))
    })

    return {
      selectedIndex,
      appPages,
      albumsOutline,
      calendar,
      settings,
      store,
      translate
    };
  }
});
</script>
<style scoped>

ion-menu.md ion-item.selected ion-icon {
  color: var(--ion-color-secondary);
}

ion-menu.ios ion-item.selected ion-icon {
  color: var(--ion-color-secondary);
}

ion-item.selected {
  --color: var(--ion-color-secondary);
}
</style>
