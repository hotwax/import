<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal"> 
          <ion-icon :icon="close" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Help") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-list>
      <ion-item lines="full">
        <ion-label>{{ translate("Sample CSV") }}</ion-label>
        <ion-button fill="outline" @click="downloadSampleCsv">
          <ion-icon slot="start" :icon="downloadOutline" />
          {{ translate("Download") }}
        </ion-button>
      </ion-item>

      <ion-item>
        <ion-label>{{ translate("Product: Select the type of product identification used in the CSV. If the selected identification is not available on a row in the uploaded CSV, it will be skipped and presented in an error file.") }}</ion-label>
      </ion-item>

      <ion-item>
        <ion-label>{{ translate("Facility: Use the internal ID of facilities in HotWax. Select external ID option if the uploaded CSV file is coming from a system like an ERP.") }}</ion-label>
      </ion-item>

      <ion-item>
        <ion-label>{{ translate("Quantity: The amount to adjust the inventory by or the inventory level the inventory should be set to.") }}</ion-label>
      </ion-item>
    </ion-list>
  </ion-content>
</template>

<script lang="ts">
import { 
  IonButtons,
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonIcon,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { defineComponent } from "vue";
import { close, downloadOutline } from "ionicons/icons";
import { translate } from "@hotwax/dxp-components";
import { jsonToCsv } from "@/utils";

export default defineComponent({
  name: "HelpModal",
  components: {
    IonButtons,
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonTitle,
    IonToolbar 
  },
  data() {
    return {
      sampleData: [{ identification: "", quantity: "", facilityId: "" }]
    }
  },
  methods: {
    closeModal() {
      modalController.dismiss({ dismissed: true });
    },
    downloadSampleCsv() {
      jsonToCsv(this.sampleData, {
        download: true,
        name: "Sample CSV.csv"
      })
    }
  },
  setup() {
    return {
      close,
      downloadOutline,
      translate
    };
  }
})
</script>