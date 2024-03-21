<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal"> 
          <ion-icon :icon="close" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Missing facilities") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-list>
      <ion-item v-for="(items, facilityId) in itemsByFacilityId" :key="facilityId" lines="full">
        <ion-select interface="popover" :placeholder="translate('Map facility')" @ionChange="updateFacility($event, facilityId)">
          <ion-label slot="label">
            {{ facilityId }}
            <p>{{ items?.length }} {{ translate("line items") }}</p>
          </ion-label>
          <ion-select-option v-for="facility in facilities" :key="facility.facilityId" :value="facility.facilityId">{{ facility.facilityName }}</ion-select-option>
        </ion-select>
      </ion-item>
    </ion-list>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button :disabled="!Object.keys(itemsByFacilityId).length" @click="save">
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
import { showToast } from "@/utils";
import { translate } from "@hotwax/dxp-components";
import emitter from "@/event-bus";

export default defineComponent({
  name: "MissingFacilitiesModal",
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
    IonList,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar 
  },
  props: ["itemsWithMissingFacility", "type"],
  data() {
    return {
      itemsByFacilityId: {},
      facilityMapping: {} as any
    }
  },
  computed: {
    ...mapGetters({
      purchaseOrders: 'order/getPurchaseOrders',
      stockItems: 'stock/getStockItems',
      facilities: 'util/getFacilities',
    })
  },
  mounted(){
    this.groupItemsByFacilityId();
  },
  methods: {
    async save(){
      if(this.type === 'order'){
        this.store.dispatch('order/updateMissingFacilities', this.facilityMapping)
      } else {
        emitter.emit('presentLoader');
        await this.store.dispatch('stock/updateMissingFacilities', this.facilityMapping)
        emitter.emit('dismissLoader');
      }
      this.closeModal();
      showToast(translate("Changes have been successfully applied"));
    },
    updateFacility(ev: any, facilityId: any){
      this.facilityMapping[facilityId] = ev.target.value
    },
    closeModal() {
      modalController.dismiss({ dismissed: true });
    },
    groupItemsByFacilityId(){
      this.itemsByFacilityId = this.itemsWithMissingFacility.reduce((itemsByFacilityId: any, item: any) => {
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
      store,
      translate
    };
  },
});
</script>
