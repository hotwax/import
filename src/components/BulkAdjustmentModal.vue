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
      <ion-label>{{ $t("Buffer days") }}</ion-label>
      <ion-input v-model="bufferDays" type="number" :placeholder = "$t('Lead time')" min="1" /> 
    </ion-item>

    <ion-item lines="full">
      <ion-label>{{ $t("Order buffer") }}</ion-label>
      <ion-input v-model="orderBuffer" type="number" :placeholder = "$t('Safety stock')" min="1" />
    </ion-item>

    <ion-item>
      <ion-label>{{ $t("Catalog") }}</ion-label>
      <ion-select interface="popover" v-model="isNewProduct">
        <ion-select-option value="N">{{ $t("Backorder") }}</ion-select-option>
        <ion-select-option value="Y">{{ $t("Preorder") }}</ion-select-option>
      </ion-select>
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
import { DateTime } from "luxon";
import { showToast } from "@/utils";
import { translate } from "@/i18n";
export default defineComponent({
  name: "BulkAdjustmentModal",
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
      bufferDays: 0,
      orderBuffer: 0,
      isNewProduct: "N",
      facilityId: "",
      orderBufferOverflow: false
    }
  },
  computed: {
    ...mapGetters({
      facilities: 'util/getFacilities',
      purchaseOrders: 'order/getPurchaseOrders',
      dateTimeFormat : 'user/getDateTimeFormat',
    })
  },
  methods: {
    closeModal() {
      modalController.dismiss({ dismissed: true });
    },
    save() {
      Object.values(this.purchaseOrders.parsed).flat().map((item: any) => {
        if (item.isSelected) {
          if(item.quantityOrdered <= this.orderBuffer) {
            item.quantityOrdered = 1;
            this.orderBufferOverflow = true;
          } 
          else item.quantityOrdered -= this.orderBuffer;
          if(this.bufferDays) item.arrivalDate = DateTime.fromFormat(item.arrivalDate, this.dateTimeFormat).plus({ days: this.bufferDays }).toFormat(this.dateTimeFormat);
          item.isNewProduct = this.isNewProduct;
          if(this.facilityId) {
            item.facilityId = this.facilityId;
            item.externalFacilityId = "";
          }
        }
      })
      if (this.orderBufferOverflow) showToast(translate("Some of the selected items have quantity less than or equal to order buffer. The quantity of those items is set to 1."));
      this.store.dispatch('order/updatePurchaseOrderItems', this.purchaseOrders.parsed);
      modalController.dismiss({ dismissed: true });
      showToast(translate("Changes have been successfully applied"));
      this.orderBufferOverflow = false;
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