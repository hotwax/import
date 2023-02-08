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

  <ion-content>
    <ion-item lines="full">
      <ion-label>{{ $t("Buffer quantity") }}</ion-label>
      <ion-input v-model="quantityBuffer" type="number" min="0" :placeholder = "$t('Quantity')" />
    </ion-item>

    <ion-item>
      <ion-label>{{ $t("Facility") }}</ion-label>
      <ion-select interface="popover" v-model="facilityId">
        <ion-select-option v-for="facility in facilities" :key="facility.facilityId" :value="facility.facilityId">{{ facility.facilityName }}</ion-select-option>
      </ion-select>
    </ion-item>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="save">
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
import { mapGetters } from "vuex";
import { showToast } from "@/utils";
import { translate } from "@/i18n";
export default defineComponent({
  name: "BulkInventoryAdjustmentModal",
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
  data() {
    return {
      quantityBuffer: 0,
      facilityId: "",
    }
  },
  computed: {
    ...mapGetters({
      stockItems: 'stock/getItemsStock',  
      facilities: 'util/getFacilities',
    })
  },
  methods: {
    closeModal() {
      modalController.dismiss({ dismissed: true });
    },
    async save() {
      const facilityLocations = await this.store.dispatch('user/fetchFacilityLocations', [this.facilityId]);
      const locationSeqId = facilityLocations[this.facilityId] && facilityLocations[this.facilityId][0] ? facilityLocations[this.facilityId][0].locationSeqId : '';
      await this.stockItems.parsed.map((item: any) => {
        if (item.isSelected) {
          item.quantity -= this.quantityBuffer;
          if(this.facilityId) {
            item.facilityId = this.facilityId;
            item.externalFacilityId = "";
            item.locationSeqId = locationSeqId;
          }
        }
      })
      await this.store.dispatch('stock/updateStockItems', this.stockItems)
      this.closeModal();
      showToast(translate("Changes have been successfully applied"));
    },
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