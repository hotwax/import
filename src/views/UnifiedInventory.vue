<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ translate("Inventory") }}</ion-title>
        <ion-buttons slot="end">
          <ion-button size="medium">
            <ion-icon slot="icon-only" :icon="informationCircleOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main>
        <section>
          <ion-list>
            <ion-list-header>{{ translate("Select the type of inventory you’re uploading") }}</ion-list-header>
            <ion-item button @click="exactInventory('atp')">
              <ion-label>{{ translate("Exact ATP") }}
                <p>{{ translate("Suggested for inventory received from a warehouse or similar system.") }}</p>
              </ion-label>
              <ion-icon slot="end" :icon="chevronForwardOutline" />
            </ion-item>
            <ion-item button @click="exactInventory('qoh')">
              <ion-label>{{ translate("Exact QoH") }}
                <p>{{ translate("Suggested for inventory received from a warehouse or similar system.") }}</p>
              </ion-label>
              <ion-icon slot="end" :icon="chevronForwardOutline" />
            </ion-item>
            <ion-item button @click="router.push({ name: 'AdjustInventory' })">
              <ion-label>{{ translate("Adjust by a certain amount") }}</ion-label>
              <ion-icon slot="end" :icon="chevronForwardOutline" />
            </ion-item>
            <ion-item button @click="exactInventory('cycleCount')">
              <ion-label>{{ translate("Cycle count or similar") }}
                <p>{{ translate("Suggested for resetting products with suppressed inventory due to rejections") }}</p>
              </ion-label>
              <ion-icon slot="end" :icon="chevronForwardOutline" />
            </ion-item>
            <ion-item button @click="router.push({ name: 'ScheduledIncomingInventory' })">
              <ion-label>{{ translate("Scheduled incoming inventory") }}
                <p>{{ translate("Auto receive inventory at a given time") }}</p>
              </ion-label>
              <ion-icon slot="end" :icon="chevronForwardOutline" />
            </ion-item>
            <ion-item button @click="router.push({ name: 'PurchaseOrder' })">
              <ion-label>{{ translate("Future inventory for pre-order") }}</ion-label>
              <ion-icon slot="end" :icon="chevronForwardOutline" />
            </ion-item>
          </ion-list>
        </section>
      </main>
    </ion-content>
  </ion-page>
</template>

<script>
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonToolbar, IonTitle } from "@ionic/vue";
import { chevronForwardOutline, informationCircleOutline } from "ionicons/icons";
import { defineComponent } from "vue";
import { useRouter } from 'vue-router';
import { useStore } from "vuex";
import { translate } from "@hotwax/dxp-components";

export default defineComponent({
  name: "Inventory",
  components: {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonPage,
    IonToolbar,
    IonTitle,
  },
  data() {
    return{
      configMapping: [
        { type: "atp", configId: "RESET_INVENTORY" },
        { type: "qoh", configId: "RESET_INVENTORY" },
        { type: "cycleCount", configId: "REC_INV_COUNT" }
      ]
    }
  },
  methods: {
    exactInventory(type) {
      const config = this.configMapping.find(config => config.type === type)
      this.store.dispatch('util/updateExactInventoryType', config);
      this.router.push({ name:'Inventory' })
    }
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    return {
      chevronForwardOutline,
      informationCircleOutline,
      router,
      store,
      translate
    }
  } 
})
</script>

<style scoped>
main {
  display: flex;
  justify-content: center;
  gap: var(--spacer-2xl);
  max-width: 990px;
  margin: var(--spacer-base) auto 0;
}

section {
  display: grid;
  grid-template-columns: minmax(400px, 1fr);
  max-width: 50ch;
}
</style>