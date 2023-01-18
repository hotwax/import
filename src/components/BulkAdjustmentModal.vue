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
      <ion-input v-model="numberOfDays" type="number" :placeholder = "$t('Lead time')" /> 
    </ion-item>

    <ion-item lines="full">
      <ion-label>{{ $t("Order buffer") }}</ion-label>
      <ion-input v-model="numberOfPieces" type="number" :placeholder = "$t('Safety stock')" />
    </ion-item>

    <ion-item>
      <ion-label>{{ $t("Catalog") }}</ion-label>
      <ion-select interface="popover" value="N" v-model="catalog">
        <ion-select-option value="N">{{ $t("Backorder") }}</ion-select-option>
        <ion-select-option value="Y">{{ $t("Preorder") }}</ion-select-option>
      </ion-select>
    </ion-item>

    <ion-item>
      <ion-label>{{ $t("Facility") }}</ion-label>
      <ion-select interface="popover" value="facility" v-model="facilityId">
        <ion-select-option v-for="facility in facilities" :key="facility" :value="facility.facilityId">{{ facility.facilityName }}</ion-select-option>
      </ion-select>
    </ion-item>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="saveChanges">
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
  data() {
    return {
      numberOfDays: 0,
      numberOfPieces: 0,
      catalog: "N",
      facilityId: "",
    }
  },
  computed: {
    ...mapGetters({
      facilities: 'util/getFacilities',
      ordersList: 'order/getOrder',
      dateTimeFormat : 'user/getDateTimeFormat',
    })
  },
  methods: {
    closeModal() {
      modalController.dismiss({ dismissed: true });
    },
    saveChanges() {
      Object.values(this.ordersList).map((orderItems: any) => orderItems).flat().map((item: any) => {
        if (item.isSelected) {
          item.quantityOrdered -= this.numberOfPieces;
          if(this.numberOfDays) item.arrivalDate = DateTime.fromFormat(item.arrivalDate, this.dateTimeFormat).plus({ days: this.numberOfDays }).toFormat(this.dateTimeFormat);
          item.isNewProduct = this.catalog;
          if(this.facilityId) {
            item.facilityId = this.facilityId;
            item.externalFacilityId = "";
          }
        }
      })
      this.store.dispatch('order/updatedOrderListItems', this.ordersList);
      modalController.dismiss({ dismissed: true });
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