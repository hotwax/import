<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal"> 
          <ion-icon :icon="close" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ $t("Bulk adjustment") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">

    <ion-item lines="full">
      <ion-label>{{ $t("Buffer days") }}</ion-label>
      <ion-input type="number" :placeholder = "$t('Lead time')" /> 
    </ion-item>

    <ion-item lines="full">
      <ion-label>{{ $t("Order buffer") }}</ion-label>
      <ion-input type="number" :placeholder = "$t('Safety stock')" />
    </ion-item>

    <ion-item>
      <ion-label>{{ $t("Catalog") }}</ion-label>
      <ion-select interface="popover" value="N">
        <ion-select-option value="N">{{ $t("Backorder") }}</ion-select-option>
        <ion-select-option value="Y">{{ $t("Preorder") }}</ion-select-option>
      </ion-select>
    </ion-item>

    <ion-item>
      <ion-label>{{ $t("Facility") }}</ion-label>
      <ion-select interface="popover" value="facility">
        <ion-select-option value="facility">NJ Warehouse</ion-select-option>
      </ion-select>
    </ion-item>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button>
        <ion-icon :icon="saveOutline" />
      </ion-fab-button>
    </ion-fab>

  </ion-content>
</template>
<script lang="ts">
import { 
  IonButtons,
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonItem,
  IonIcon,
  IonInput,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  modalController,
} from "@ionic/vue";
import { defineComponent } from "vue";
import { close, saveOutline } from "ionicons/icons";
import { useStore } from "@/store";
export default defineComponent({
  name: "BulkAdjustment",
  components: {
    IonButtons,
    IonButton,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonInput,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar 
  },
  props: [""],
  data() {
    return { }
  },
  computed: { },
  methods: {
    closeModal() {
      modalController.dismiss({ dismissed: true });
    }
  },
  setup() {
    const store = useStore();
    return {
      close,
      saveOutline,
      store
    };
  },
});
</script>