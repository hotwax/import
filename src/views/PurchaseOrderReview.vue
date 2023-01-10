<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/purchase-order" />
        <ion-title>{{ $t("Review PO details") }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="selectAllItems()">
            <ion-icon slot="icon-only" :icon="checkboxOutline" />
          </ion-button>
          <ion-button>
            <ion-icon :icon="arrowUndoOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="header">
        <div class="search">
          <ion-searchbar :placeholder="$t('Search products')" v-model="queryString" v-on:keyup.enter="queryString = $event.target.value; searchProduct(queryString)" />
        </div>

        <div class="filters">
          <ion-item @click="bulkAdjustmentModal()"> 
            <ion-icon slot="start" :icon="calculatorOutline" />
            <ion-label>{{ $t("Bulk adjustment") }}</ion-label>
            <ion-note slot="end">{{ getSelectedItems() }} {{ $t("items selected") }}</ion-note>
            <ion-icon slot="end" :icon="chevronForwardOutline" />
          </ion-item>

          <ion-item @click="dateTimeParseErrorModal()">
            <ion-icon slot="start" :icon="timeOutline" />
            <ion-label>{{ $t("Date time parse error") }}</ion-label>
            <ion-note slot="end">{{ getItemsWithInvalidDateFormat() }} {{ $t("items") }}</ion-note>
            <ion-icon slot="end" :icon="chevronForwardOutline" />
          </ion-item>

          <ion-item @click="missingFacilityModal()">
            <ion-icon slot="start" :icon="businessOutline" />
            <ion-label>{{ $t("Missing facilities") }}</ion-label>
            <ion-note slot="end">{{ getItemsWithMissingFacility().length }} {{ $t("items") }}</ion-note>
            <ion-icon slot="end" mode="ios" :icon="chevronForwardOutline" />
          </ion-item>

          <ion-item @click="listMissingSkus()">
            <ion-icon slot="start" :icon="shirtOutline" />
            <ion-label>{{ $t("Missing products") }}</ion-label>
            <ion-note slot="end">{{ unidentifiedProductItems.length }} {{ $t("items") }}</ion-note>
            <ion-icon slot="end" :icon="chevronForwardOutline" />
          </ion-item>
        </div>
      </div>

      <div v-if="segmentSelected === 'all'">
        <PurchaseOrderDetail :ordersList="ordersList" />
      </div>
      <div v-for="(po, poId) in ordersList" :key="poId" >
        <PurchaseOrderDetail v-if="segmentSelected === poId" :ordersList="{[poId]: po}" />
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button :disabled="isDateInvalid()" @click="save">
          <ion-icon :icon="cloudUploadOutline" />
        </ion-fab-button>
      </ion-fab>
        
    </ion-content>

    <ion-footer>
      <ion-segment v-model="segmentSelected">
        <ion-segment-button value="all">
          <ion-label>{{ $t("All") }}</ion-label>
        </ion-segment-button>
        <ion-segment-button v-for="(po, poId) in ordersList" :key="poId" :value="poId">
          <ion-label>{{ poId }}</ion-label>
        </ion-segment-button>
      </ion-segment>
    </ion-footer>
  </ion-page>
</template>   
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { mapGetters, useStore } from "vuex";
import { useRouter } from 'vue-router';
import { DateTime } from 'luxon';
import { IonPage, IonHeader, IonToolbar, IonBackButton, IonTitle, IonContent, IonFooter, IonSearchbar, IonItem, IonLabel, IonIcon, IonButton, IonButtons, IonFab, IonFabButton, IonSegment, IonSegmentButton, IonNote, alertController, modalController } from '@ionic/vue'
import { ellipsisVerticalOutline, businessOutline, shirtOutline, sendOutline, checkboxOutline, calculatorOutline, cloudUploadOutline, arrowUndoOutline, chevronForwardOutline, timeOutline } from 'ionicons/icons'
import PurchaseOrderDetail from '@/components/PurchaseOrderDetail.vue'
import DateTimeParseErrorModal from '@/components/DateTimeParseErrorModal.vue';
import BulkAdjustmentModal from '@/components/BulkAdjustmentModal.vue';
import MissingFacilityModal from '@/components/MissingFacilitiesModal.vue';
import MissingSkuModal from "@/components/MissingSkuModal.vue"
import { UploadService } from "@/services/UploadService";
import { OrderService } from "@/services/OrderService";
import { hasError } from "@/utils";
import { showToast } from '@/utils';
import { translate } from "@/i18n";

export default defineComponent({
  name: 'PurchaseOrderReview',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonBackButton,
    IonTitle,
    IonContent,
    IonFooter,
    IonSearchbar,
    IonItem,
    IonLabel,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonNote,
    IonButton,
    IonButtons,
    IonFab,
    IonFabButton,
    PurchaseOrderDetail
  },
  computed: {
    ...mapGetters({
      facilities: 'util/getFacilities',
      ordersList: 'order/getOrder',
      originalItems: 'order/getOriginalItems',
      unidentifiedProductItems: 'order/getUnidentifiedProductItems',
      getProduct: 'product/getProduct',
      instanceUrl: 'user/getInstanceUrl',
      dateTimeFormat : 'user/getDateTimeFormat',
      fileName: 'order/getFileName'
    })
  },
  data() {
    return {
      numberOfDays: 0,
      numberOfPieces: 0,
      catalog: "N",
      facilityId: (this as any)?.ordersList?.items[0]?.facilityId,
      queryString: "",
      searchedProduct: {} as any,
      isParentProductUpdated: false,
      isPOUploadedSuccessfully: false
    }
  },
  ionViewDidEnter(){
    this.store.dispatch('util/fetchFacilities');
  },
  async beforeRouteLeave() {
    let canLeave = false;
    const alert = await alertController.create({
      header: this.$t("Leave page"),
      message: this.$t("Any edits made to this PO will be lost."),
      buttons: [
        {
          text: this.$t("STAY"),
          handler: () => {
            canLeave = false;
          },
        },
        {
          text: this.$t("LEAVE"),
          handler: () => {
            canLeave = true;
          },
        },
      ],
    });
    if(!this.isPOUploadedSuccessfully){
      alert.present();
      await alert.onDidDismiss();
      return canLeave;
    } else {
      this.isPOUploadedSuccessfully = false;
    }
  },
  methods: {
    getSelectedItems(){
      return Object.values(this.ordersList).map((orderItems: any) => orderItems).flat().filter((item) => item.isSelected).length;
    },
    getItemsWithInvalidDateFormat(){
      return Object.values(this.ordersList).map((orderItems: any) => orderItems).flat().filter((item) => !DateTime.fromFormat(item.arrivalDate, this.dateTimeFormat).isValid).length;
    },
    getItemsWithMissingFacility() {
      const facilityIds = this.facilities.map((facility: any) => facility.facilityId)
      return Object.values(this.ordersList).map((orderItems: any) => orderItems).flat().filter((item) => !facilityIds.includes(item.externalFacilityId) && item.externalFacilityId !== "");
    },
    isDateInvalid(){
      // Checked if any of the date format is different than the selected format.
      return Object.values(this.ordersList).map((orderItems: any) => orderItems).flat().some((item: any) => !DateTime.fromFormat(item.arrivalDate, this.dateTimeFormat).isValid);
    },
    async listMissingSkus() {
      const missingSkuModal = await modalController.create({
        component: MissingSkuModal,
        componentProps: { 'unidentifiedProductItems': this.unidentifiedProductItems }
      });
      return missingSkuModal.present();
    },
    searchProduct(sku: any) {
      const product = this.getProduct(sku);
      this.searchedProduct = Object.values(this.ordersList).flat(1).find((item: any) => {
        return item.internalName === product.internalName;
      })
    },
    async dateTimeParseErrorModal() {
      const dateTimeParseErrorModal = await modalController.create({
        component: DateTimeParseErrorModal,
        componentProps: { }
      });
      return dateTimeParseErrorModal.present();
    },
    async save(){
      const uploadData = Object.values(this.ordersList).map((orderItems: any) => orderItems).flat().filter((item: any) => {
        return item.isSelected;
      }).map((item: any) => {
        return {
          "poId": " ",
          "externalId": item.orderId,
          "facilityId": item.facilityId,
          "externalFacilityId": item.externalFacilityId,
          //Convert date in the format accepted by the server.
          "arrivalDate": DateTime.fromFormat(item.arrivalDate, this.dateTimeFormat).toFormat('MM/dd/yyyy'),
          "quantity": item.quantityOrdered,
          "isNewProduct": item.isNewProduct,
          "idValue": item.shopifyProductSKU,
          "idType": "SKU"
        };
      })
      const fileName = this.fileName.replace(".csv", ".json");
      const params = {
        "configId": "IMP_PO"
      }
      const alert = await alertController.create({
        header: this.$t("Upload purchase order"),
        message: this.$t("Make sure all the data you have entered is correct and only pre-order or backorder items are selected."),
        buttons: [
          {
            text: this.$t("cancel"),
            role: 'cancel',
          },
          {
            text: this.$t("Upload"),
            handler: () => {
              UploadService.uploadJsonFile(UploadService.prepareUploadJsonPayload({
                uploadData,
                fileName,
                params
              })).then(() => {
                this.isPOUploadedSuccessfully = true;
                showToast(translate("The PO has been uploaded successfully"), [{
                  text: translate('View'),
                  role: 'view',
                  handler: () => {
                    window.open(`https://${this.instanceUrl}.hotwax.io/commerce/control/ImportData?configId=IMP_PO`, '_blank');
                  }
                }])
                this.router.push("/purchase-order");
                this.store.dispatch('order/clearOrderList');
              }).catch(() => {
                showToast(translate("Something went wrong, please try again"));
              })
            },
          },
        ],
      });
      return alert.present();  
    },
    async bulkAdjustmentModal() {
      const bulkAdjustmentModal = await modalController.create({
        component: BulkAdjustmentModal,
        componentProps: { }
      });
      return bulkAdjustmentModal.present();
    },
    async missingFacilityModal() {
      const ItemsWithMissingFacility = this.getItemsWithMissingFacility();
      const missingFacilityModal = await modalController.create({
        component: MissingFacilityModal,
        componentProps: { ItemsWithMissingFacility, facilities: this.facilities }
      });
      return missingFacilityModal.present();
    },
    selectAllItems() {
      Object.values(this.ordersList).map((orderItems: any) => orderItems).flat().forEach((item: any) => {
        item.isSelected = true;
      })
    },
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    const segmentSelected = ref('all');
    
    return {
      checkboxOutline,
      calculatorOutline,
      ellipsisVerticalOutline,
      sendOutline,
      arrowUndoOutline,
      businessOutline,
      cloudUploadOutline,
      chevronForwardOutline,
      timeOutline,
      shirtOutline,
      segmentSelected,
      router,
      store,
    }
  }
});

</script>

<style scoped>
  .header {
    margin-bottom: var(--spacer-sm);
    padding: var(--spacer-sm);
  }
  
  .filters > ion-button {
    margin-top: var(--spacer-sm);
  }

  ion-footer {
    max-width: fit-content;
  }

  ion-segment {
    --background: white;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.14), 0px 4px 5px rgba(0, 0, 0, 0.12), 0px 1px 10px rgba(0, 0, 0, 0.2);
    border-radius: 0px 4px 0px 0px;
  }
  
  @media (min-width: 991px) {
    .header {
      display: grid;
      grid: "search filters"
            /1fr 1fr;
      gap: var(--spacer-sm);
    }
  
    .search {
      grid-area: search;
    } 
  
    .filters {
      grid-area: filters;
    }
  }
</style>