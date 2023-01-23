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
      <ion-select interface="popover" slot="end" placeholder="Map facility" @ionChange="updateFacility($event, facilityId)">
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
      items: {},
      mapFacility: {} as any
    }
  },
  computed: {
    ...mapGetters({
      ordersList: 'order/getOrder'
    })
  },
  mounted(){
    this.itemsByFacilityId();
  },
  methods: {
    save(){
      Object.keys(this.mapFacility).map((missingFacility: any) => {
        Object.values(this.ordersList).map((orderItems: any) => orderItems).flat().map((item: any) => {
          if(item.externalFacilityId === missingFacility){
            item.externalFacilityId = "";
            item.facilityId = this.mapFacility[missingFacility];
          }
        })
      })
      this.store.dispatch('order/updatedOrderListItems', this.ordersList);
      modalController.dismiss({ dismissed: true });
      showToast(translate("Changes have been successfully applied"));
    },
    updateFacility(ev: any, missingFacility: any){
      this.mapFacility[missingFacility] = ev.target.value
    },
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