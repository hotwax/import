<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal"> 
          <ion-icon :icon="close" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ $t("Missing facilities") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>

    <ion-item v-for="(products, facilityId) in items" :key="facilityId" lines="full">
      <ion-label>
        {{ facilityId }}
        <p>{{ products?.length }} {{ $t("line items") }}</p>
      </ion-label>
      <ion-select interface="popover" slot="end" placeholder="Map facility">
        <ion-select-option v-for="facility in facilities" :key="facility.facilityId" value="facility.facilityId">{{ facility.facilityName }}</ion-select-option>
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
  name: "MissingFacilityModal",
  components: {
    IonButtons,
    IonButton,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar 
  },
  props: ["ItemsWithMissingFacility", "facilities"],
  data() {
    return {
      items: {}
    }
  },
  computed: { },
  mounted(){
    this.itemsByFacilityId();
  },
  methods: {
    closeModal() {
      modalController.dismiss({ dismissed: true });
    },
    itemsByFacilityId(){
      this.items = this.ItemsWithMissingFacility.reduce((itemsByFacilityId: any, item: any) => {
        itemsByFacilityId[item.externalFacilityId] ? itemsByFacilityId[item.externalFacilityId].push(item) : itemsByFacilityId[item.externalFacilityId] = [item];
        return itemsByFacilityId;
      }, {});
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