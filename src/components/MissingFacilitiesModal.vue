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

    <ion-item v-for="(items, facilityId) in itemsByFacilityId" :key="facilityId" lines="full">
      <ion-label>
        {{ facilityId }}
        <p>{{ items?.length }} {{ $t("line items") }}</p>
      </ion-label>
      <ion-select interface="popover" slot="end" :placeholder="$t('Map facility')" @ionChange="updateFacility($event, facilityId)">
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
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar 
  },
  props: ["itemsWithMissingFacility", "facilities", "type"],
  data() {
    return {
      itemsByFacilityId: {},
      facilityMapping: {} as any
    }
  },
  computed: {
    ...mapGetters({
      purchaseOrders: 'order/getPurchaseOrders',
      stock: 'stock/getItemsStock',
      getFacilityLocationsByFacilityId: 'user/getFacilityLocationsByFacilityId',
    })
  },
  mounted(){
    this.groupItemsByFacilityId();
  },
  methods: {
    async save(){
      if(this.type === 'order'){
        Object.keys(this.facilityMapping).map((facilityId: any) => {
          Object.values(this.purchaseOrders.parsed).flat().map((item: any) => {
            if(item.externalFacilityId === facilityId){
              item.externalFacilityId = "";
              item.facilityId = this.facilityMapping[facilityId];
            }
          })
        })
        this.store.dispatch('order/updatePurchaseOrders', this.purchaseOrders);
      } else {
        await this.store.dispatch('user/fetchFacilityLocations', Object.values(this.facilityMapping));
        Object.keys(this.facilityMapping).map((facilityId: any) => {
          const locationSeqId = this.getFacilityLocationsByFacilityId(this.facilityMapping[facilityId]).length ? this.getFacilityLocationsByFacilityId(this.facilityMapping[facilityId])[0].locationSeqId : '';
          this.stock.parsed.map((item: any) => {
            if(item.externalFacilityId === facilityId){
              item.externalFacilityId = "";
              item.facilityId = this.facilityMapping[facilityId];
              item.locationSeqId = locationSeqId;
            }
          })
        })
        this.store.dispatch('stock/updateStockItems', this.stock.parsed);
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
      store
    };
  },
});
</script>