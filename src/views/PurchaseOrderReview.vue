<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/purchase-order" />
        <ion-title>{{ $t("Review PO details") }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="selectAllItems(segmentSelected)">
            <ion-icon slot="icon-only" :icon="checkboxOutline" />
          </ion-button>
          <ion-button @click="revertAll()">
            <ion-icon :icon="arrowUndoOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="header">
        <div class="search">
          <ion-searchbar :placeholder="$t('Search products')" @keyup.enter="queryString = $event.target.value; searchProduct(queryString)" />
        </div>

        <div class="filters">
          <ion-item @click="openBulkAdjustmentModal()" button> 
            <ion-icon slot="start" :icon="calculatorOutline" />
            <ion-label>{{ $t("Bulk adjustment") }}</ion-label>
            <ion-note slot="end">{{ getSelectedItems() }} {{ $t("items selected") }}</ion-note>
            <ion-icon slot="end" :icon="chevronForwardOutline" />
          </ion-item>

          <ion-item @click="openDateTimeParseErrorModal()" button>
            <ion-icon slot="start" :icon="timeOutline" />
            <ion-label>{{ $t("Date time parse error") }}</ion-label>
            <ion-note slot="end">{{ getItemsWithInvalidDateFormat() }} {{ $t("items") }}</ion-note>
            <ion-icon slot="end" :icon="chevronForwardOutline" />
          </ion-item>

          <ion-item @click="openMissingFacilitiesModal()" button>
            <ion-icon slot="start" :icon="businessOutline" />
            <ion-label>{{ $t("Missing facilities") }}</ion-label>
            <ion-note slot="end">{{ getItemsWithMissingFacility().length }} {{ $t("items") }}</ion-note>
            <ion-icon slot="end" mode="ios" :icon="chevronForwardOutline" />
          </ion-item>

          <ion-item @click="openMissingSkuModal()" button>
            <ion-icon slot="start" :icon="shirtOutline" />
            <ion-label>{{ $t("Missing products") }}</ion-label>
            <ion-note slot="end">{{ purchaseOrders.unidentifiedItems?.length }} {{ $t("items") }}</ion-note>
            <ion-icon slot="end" :icon="chevronForwardOutline" />
          </ion-item>
        </div>
      </div>
      <div v-if="searchedProduct?.pseudoId">
        <PurchaseOrderDetail :purchaseOrders="purchaseOrders" :itemsByPoId ="{[searchedProduct?.orderId]: [searchedProduct]}"  />
      </div>

      <div class="ion-text-center" v-else-if="queryString">
        <p>{{ $t("No results found")}}</p>
      </div>

      <div v-else>
        <div v-if="segmentSelected === 'all'">
          <PurchaseOrderDetail :purchaseOrders="purchaseOrders" :itemsByPoId ="purchaseOrders.parsed"  />
        </div>
        <div v-for="(po, poId) in purchaseOrders.parsed" :key="poId" >
          <PurchaseOrderDetail v-if="segmentSelected === poId" :itemsByPoId="{[poId]: po}" :purchaseOrders="purchaseOrders" />
        </div>
      </div>

      

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button :disabled="isDateInvalid()" @click="save">
          <ion-icon :icon="cloudUploadOutline" />
        </ion-fab-button>
      </ion-fab>
        
    </ion-content>

    <ion-footer>
      <ion-segment scrollable="true" @ionChange="selectAllItems($event.target.value); searchProduct(queryString);" v-model="segmentSelected">
        <ion-segment-button value="all">
          <ion-label>{{ $t("All") }}</ion-label>
        </ion-segment-button>
        <ion-segment-button v-for="(po, poId) in purchaseOrders.parsed" :key="poId" :value="poId">
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
import MissingFacilitiesModal from '@/components/MissingFacilitiesModal.vue';
import MissingSkuModal from "@/components/MissingSkuModal.vue"
import { UploadService } from "@/services/UploadService";
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
      purchaseOrders: 'order/getPurchaseOrders',
      getProduct: 'product/getProduct',
      instanceUrl: 'user/getInstanceUrl',
      dateTimeFormat : 'user/getPreferredDateTimeFormat',
      fileName: 'order/getFileName'
    })
  },
  data() {
    return {
      catalog: "N",
      facilityId: "",
      queryString: "",
      searchedProduct: {} as any,
      isParentProductUpdated: false,
      isPOUploadedSuccessfully: false
    }
  },
  ionViewDidEnter(){
    this.store.dispatch('util/fetchFacilities');
  },
  async beforeRouteLeave(to) {
    if(to.path === "/login" ) return;
    let canLeave = false;
    const alert = await alertController.create({
      header: this.$t("Leave page"),
      message: this.$t("Any edits made on this page will be lost."),
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
      return Object.values(this.purchaseOrders.parsed).flat().filter((item: any) => item.isSelected).length;
    },
    getItemsWithInvalidDateFormat(){
      return Object.values(this.purchaseOrders.parsed).flat().filter((item: any) => !DateTime.fromFormat(item.arrivalDate, this.dateTimeFormat).isValid).length;
    },
    getItemsWithMissingFacility() {
      const externalFacilityIds = this.facilities.reduce((externalFacilityIds: any, facility: any) => {
        if (facility.externalId) externalFacilityIds.push(facility.externalId);
        return externalFacilityIds;
      }, [])

      // if facilityId is set, this is facility set from the facility list
      // if externalFacilityId doesn't exist, case for missing facility
      // if externalFacilityId exist and not found in facility list, case for missing facility
      return Object.values(this.purchaseOrders.parsed).flat().filter((item: any) => !item.facilityId && (!item.externalFacilityId || (item.externalFacilityId && !externalFacilityIds.includes(item.externalFacilityId))));
    },
    isDateInvalid(){
      // Checked if any of the date format is different than the selected format.
      return Object.values(this.purchaseOrders.parsed).flat().some((item: any) => !DateTime.fromFormat(item.arrivalDate, this.dateTimeFormat).isValid);
    },
    async openMissingSkuModal() {
      const missingSkuModal = await modalController.create({
        component: MissingSkuModal,
        componentProps: { 'unidentifiedItems': this.purchaseOrders.unidentifiedItems, type: 'order' }
      });
      missingSkuModal.onDidDismiss().then(() => {
        this.searchProduct(this.queryString);
      });
      
      return missingSkuModal.present();
    },
    searchProduct(sku: any) {
      const product = this.getProduct(sku);
      if (!product?.pseudoId) {
        this.searchedProduct = {};
        return;
      }  
      if(this.segmentSelected === 'all'){
        this.searchedProduct = Object.values(this.purchaseOrders.parsed).flat().find((item: any) => {
          return item.pseudoId === product.pseudoId;
        })
      } else {
        this.searchedProduct = this.purchaseOrders.parsed[this.segmentSelected].find((item: any) => {
          return item.pseudoId === product.pseudoId;
        })
      }
    },
    async openDateTimeParseErrorModal() {
      const dateTimeParseErrorModal = await modalController.create({
        component: DateTimeParseErrorModal,
        componentProps: { numberOfItems: Object.values(this.purchaseOrders.parsed).flat().length, numberOfPos: Object.keys(this.purchaseOrders.parsed).length }
      });
      dateTimeParseErrorModal.onDidDismiss().then(() => {
        this.searchProduct(this.queryString);
      });
     
      return dateTimeParseErrorModal.present();
    },
    async save(){
      const uploadData = Object.values(this.purchaseOrders.parsed).flat().filter((item: any) => {
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
          "idValue": item.identification,
          "idType": item.identificationTypeId
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
                    const omsURL = (this.instanceUrl.startsWith('http') ? this.instanceUrl.replace(/api\/?/, "") : `https://${this.instanceUrl}.hotwax.io`) + `/commerce/control/ImportData?configId=IMP_PO`
                    window.open(omsURL, '_blank');
                  }
                }])
                this.router.push("/purchase-order");
                this.store.dispatch('order/updatePurchaseOrders', {parsed: {}, original: {}, unidentifiedItems: []});
              }).catch(() => {
                showToast(translate("Something went wrong, please try again"));
              })
            },
          },
        ],
      });
      return alert.present();  
    },
    async openBulkAdjustmentModal() {
      const bulkAdjustmentModal = await modalController.create({
        component: BulkAdjustmentModal,
      });
      bulkAdjustmentModal.onDidDismiss().then(() => {
        this.searchProduct(this.queryString);
      })
      
      return bulkAdjustmentModal.present();
    },
    async openMissingFacilitiesModal() {
      const itemsWithMissingFacility = this.getItemsWithMissingFacility();
      const missingFacilitiesModal = await modalController.create({
        component: MissingFacilitiesModal,
        componentProps: { itemsWithMissingFacility, type: 'order' }
      });
      missingFacilitiesModal.onDidDismiss().then(() => {
        this.searchProduct(this.queryString);
      });
      
      return missingFacilitiesModal.present();
    },
    selectAllItems(segmentSelected: string) {
      if(segmentSelected === 'all'){
        Object.values(this.purchaseOrders.parsed).flat().map((item: any) => {
          item.isSelected = true;
        })
      } else {
        Object.values(this.purchaseOrders.parsed).flat().map((item: any) => {
          if(item.orderId === segmentSelected){
            item.isSelected = true;
          } else {
            item.isSelected = false;
          }
        })
      }
      this.store.dispatch('order/updatePurchaseOrders', this.purchaseOrders);
    },
    revertAll() {
      this.purchaseOrders.parsed = JSON.parse(JSON.stringify(this.purchaseOrders.original));
      this.store.dispatch('order/updatePurchaseOrders', this.purchaseOrders);
    }
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