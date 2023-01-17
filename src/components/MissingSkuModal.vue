<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="closeModal">
            <ion-icon :icon="closeOutline" slot="icon-only" />
          </ion-button>
        </ion-buttons>
        <ion-title>{{ $t("Missing SKUs") }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div>
        <ion-item>
          <ion-input :clear-input="true" />
          <ion-note slot="helper">Helper and error text</ion-note>
        </ion-item>
        <ion-button>{{ $t("Update") }}</ion-button>
      </div>
      
      <ion-segment class="" v-model="segmentSelected">
        <ion-segment-button value="pending">
          <ion-label>{{ $t("Pending") }}</ion-label>
        </ion-segment-button>
        <ion-segment-button value="completed">
          <ion-label>{{ $t("Completed") }}</ion-label>
        </ion-segment-button>
      </ion-segment>
      
      <ion-list>
        <ion-radio-group>
          <ion-item v-for="item in unidentifiedProductItems" :key="item.shopifyProductSKU">
            <ion-label>
              {{ item.shopifyProductSKU }}
              <p>{{ item.orderId }}</p>
            </ion-label>
            <ion-radio slot="end" :value="item" />
          </ion-item>
        </ion-radio-group>
      </ion-list>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button>
          <ion-icon :icon="saveOutline" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonSegment,
  IonSegmentButton,
  IonHeader,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { closeOutline, saveOutline } from 'ionicons/icons';
import { defineComponent } from "@vue/runtime-core";
import { ref } from "vue";

export default defineComponent({
  name: "MissingSkuModal",
  components: {
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonSegment,
  IonSegmentButton,
  IonHeader,
  IonTitle,
  IonToolbar
  },
  props: ['unidentifiedProductItems'],
  methods: {
    closeModal() {
      modalController.dismiss({ dismissed: true });
    }
  },
  setup() {
    const segmentSelected = ref('pending');
    return {
      closeOutline,
      saveOutline,
      segmentSelected
    }
  }
})
</script>
<style scoped>
  div {
    display: flex;
  }

  div ion-item {
    flex-grow: 1;
  }
  
  ion-button {
    margin: var(--spacer-sm);
  }
</style>