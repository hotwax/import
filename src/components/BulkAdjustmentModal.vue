<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal"> 
          <ion-icon :icon="close" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Bulk adjustment") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-list>
      <ion-item lines="full">
        <ion-input :label="translate('Buffer days')" v-model="bufferDays" type="number" :placeholder="translate('Lead time')" min="1" />
      </ion-item>

      <ion-item lines="full">
        <ion-input :label="translate('Order buffer')" v-model="orderBuffer" type="number" :placeholder="translate('Safety stock')" min="1" />
      </ion-item>

      <ion-item>
        <ion-select :label="translate('Catalog')" interface="popover" v-model="isNewProduct">
          <ion-select-option value="N">{{ translate("Backorder") }}</ion-select-option>
          <ion-select-option value="Y">{{ translate("Preorder") }}</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item>
        <ion-select :label="translate('Facility')" interface="popover" v-model="facilityId">
          <ion-select-option v-for="facility in facilities" :key="facility.facilityId" :value="facility.facilityId">{{ facility.facilityName }}</ion-select-option>
        </ion-select>
      </ion-item>
    </ion-list>

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
  IonList,
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
import { translate } from "@hotwax/dxp-components";
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
    IonList,
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
    }
  },
  computed: {
    ...mapGetters({
      facilities: 'util/getFacilities',
      purchaseOrders: 'order/getPurchaseOrders',
      dateTimeFormat : 'user/getPreferredDateTimeFormat',
    })
  },
  methods: {
    closeModal() {
      modalController.dismiss({ dismissed: true });
    },
    save() {
      let orderBufferOverflow = false;
      Object.values(this.purchaseOrders.parsed).flat().map((item: any) => {
        if (item.isSelected) {
          if(item.quantityOrdered <= this.orderBuffer) {
            item.quantityOrdered = 1;
            orderBufferOverflow = true;
          } else item.quantityOrdered -= this.orderBuffer;
          if(this.bufferDays) item.arrivalDate = DateTime.fromFormat(item.arrivalDate, this.dateTimeFormat).plus({ days: this.bufferDays }).toFormat(this.dateTimeFormat);
          item.isNewProduct = this.isNewProduct;
          if(this.facilityId) {
            item.facilityId = this.facilityId;
            item.externalFacilityId = "";
          }
        }
      })
      this.store.dispatch('order/updatePurchaseOrders', this.purchaseOrders);
      this.closeModal();
      if (orderBufferOverflow) showToast(translate("Changes have been successfully applied. Some of the selected items have quantity less than or equal to order buffer. The quantity of those items is set to 1.", {newLine: '<br>'}));
      else showToast(translate("Changes have been successfully applied"));
    },
  },
  setup() {
    const store = useStore();
    return {
      close,
      saveOutline,
      store,
      translate
    };
  },
});
</script>