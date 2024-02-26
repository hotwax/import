<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/inventory" />
        <ion-title v-if="!stockItems.initial || stockItems.initial.length === 0">{{stockItems.parsed.length}} {{ $t('items') }}</ion-title>
        <ion-title v-else>{{ stockItems.initial.length }} {{ $t('of') }} {{ stockItems.parsed.length }} {{ $t('items') }}</ion-title>
     
        <ion-buttons slot="end">
          <ion-button @click="revertAll">
            <ion-icon slot="icon-only" :icon="arrowUndoOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content >
      <div class="header">
        <ion-card color="light">
          <ion-card-content>
            <ion-icon slot="start" color="danger" :icon="warningOutline"></ion-icon>
            {{ $t("Please ensure that the uploaded file contains accurate product information. If a product does not exist, the corresponding records will not be processed.") }}
          </ion-card-content>
        </ion-card>
        <div class="filters">
          <ion-item @click="openMissingFacilitiesModal()" button>
            <ion-icon slot="start" :icon="businessOutline" />
            <ion-label>{{ $t("Missing facilities") }}</ion-label>
            <ion-note slot="end">{{ getItemsWithMissingFacility().length }} {{ $t("items") }}</ion-note>
            <ion-icon slot="end" mode="ios" :icon="chevronForwardOutline" />
          </ion-item>
        </div>
      </div>  

      <div class="empty-state" v-if="isProcessingFile">
        <ion-spinner name="crescent" />
        <p>{{ $t("Reviewing uploaded file") }}</p>
      </div>
      <!-- Empty state -->
      <div class="empty-state" v-else-if="!stockItems.initial || stockItems.initial.length === 0">
        <p>{{ $t("Seems like uploaded file has missing products, checked with initial records.", { initialCount: viewSize }) }}</p>
      </div>

      <template v-else>
      <div v-for="id in getParentProductIds(stockItems.initial)" :key="id">
        <div class="list-item list-header">
          <ion-item color="light" lines="none">
            <ion-label>{{ getParentInformation(id, stockItems.initial).parentProductName }}</ion-label>
          </ion-item>

          <div class="tablet" />

          <div class="tablet" />

          <div />
        </div>
        <div v-for="(item, index) in getItemsByParentProduct(id, stockItems.initial)" :key="index">
          <div class="list-item">
            <ion-item lines="none">
              <ion-thumbnail slot="start">
                <DxpShopifyImg :src="item.imageUrl" size="small" />
              </ion-thumbnail>
              <ion-label class="ion-text-wrap">
                <h3>{{ item.pseudoId }}</h3>
                <p v-if="item.initialSKU">{{ item.initialSKU }}</p>
              </ion-label>
            </ion-item>

            <ion-chip outline>
              <ion-label>{{ item.quantity }} {{ $t("Items") }}</ion-label>
            </ion-chip>

            <ion-chip outline class="tablet">
              <ion-label>{{ getFacilityName(item.facilityId, item.externalFacilityId) }}</ion-label>
            </ion-chip>
            <ion-chip outline class="tablet location">
              <ion-icon :icon="locationOutline" />
              <ion-label>{{ item.locationSeqId }}</ion-label>
            </ion-chip>
          </div>
        </div>
      </div>
      <ion-item>
        <ion-label> {{ $t('more items', { remainingItemCount: stockItems.parsed.length - stockItems.initial.length }) }}</ion-label>
      </ion-item>
      </template>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="save">
          <ion-icon :icon="cloudUploadOutline" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>  
  </ion-page>
</template>   
<script lang="ts">
import { UploadService } from "@/services/UploadService";
import { DxpShopifyImg } from "@hotwax/dxp-components";
import ProductPopover from '@/components/ProductPopover.vue'
import BulkInventoryAdjustmentModal from '@/components/BulkInventoryAdjustmentModal.vue'
import MissingFacilitiesModal from '@/components/MissingFacilitiesModal.vue'
import { defineComponent } from 'vue';
import { mapGetters, useStore } from "vuex";
import { useRouter } from 'vue-router';
import { showToast } from '@/utils';
import { translate } from "@/i18n";
import { IonCard, IonCardContent, IonPage, IonHeader, IonToolbar, IonBackButton, IonContent, IonItem, IonThumbnail, IonLabel, IonChip, IonIcon, IonButton, IonButtons, popoverController, IonFab, IonFabButton, modalController, alertController, IonNote, IonSpinner, IonTitle } from '@ionic/vue'
import { businessOutline, calculatorOutline, chevronForwardOutline, ellipsisVerticalOutline, locationOutline, shirtOutline, checkboxOutline, cloudUploadOutline, arrowUndoOutline, warningOutline } from 'ionicons/icons'

export default defineComponent({
  name: 'InventoryDetail',
  components: {
    DxpShopifyImg,
    IonCard,
    IonCardContent,
    IonPage,
    IonHeader,
    IonToolbar,
    IonBackButton,
    IonContent,
    IonItem,
    IonThumbnail,
    IonLabel,
    IonChip,
    IonIcon,
    IonButton,
    IonButtons,
    IonFab,
    IonFabButton,
    IonNote,
    IonSpinner,
    IonTitle
  },
  computed: {
    ...mapGetters({
      stockItems: 'stock/getStockItems',
      isProcessingFile: 'util/getFileProcessingStatus',
      getProduct: 'product/getProduct',
      instanceUrl: 'user/getInstanceUrl',
      facilities: 'util/getFacilities',
      fileName: 'order/getFileName',
      getFacilityLocationsByFacilityId: 'util/getFacilityLocationsByFacilityId'
    })
  },
  data() {
    return {
      facilityId: (this as any)?.stockItems?.parsed[0]?.facilityId,
      isParentProductUpdated: false,
      isCsvUploadedSuccessfully: false,
      facilityLocations: {},
      viewSize: process.env['VUE_APP_VIEW_SIZE']
    }
  },
  ionViewDidEnter(){
    this.store.dispatch('util/fetchFacilities');
  },
  async beforeRouteLeave(to) {
    if(to.path === '/login') return;
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
    if(!this.isCsvUploadedSuccessfully){
      alert.present();
      await alert.onDidDismiss();
      this.isCsvUploadedSuccessfully = false;
      return canLeave;
    }
  },
  
  methods: {
    getFacilityName(facilityId: any, externalFacilityId: any) {
      if (facilityId) {
        const facility = this.facilities.find((facility: any) => facilityId === facility.facilityId );
        return facility ? facility.facilityName : facilityId;
      } else if (externalFacilityId) {
        const facility = this.facilities.find((facility: any) => externalFacilityId === facility.externalId );
        return facility ? facility.facilityName : externalFacilityId;
      }
      return externalFacilityId;
    },
    getItemsWithMissingFacility() {
      const externalFacilityIds = this.facilities.reduce((externalFacilityIds: any, facility: any) => {
        if (facility.externalId) externalFacilityIds.push(facility.externalId);
        return externalFacilityIds;
      }, [])
      // if facilityId is set, this is facility set from the facility list
      // if externalFacilityId doesn't exist, case for missing facility
      // if externalFacilityId exist and not found in facility list, case for missing facility
      return this.stockItems.parsed.filter((item: any) =>  !item.facilityId && (!item.externalFacilityId || (item.externalFacilityId && !externalFacilityIds.includes(item.externalFacilityId))));
    },
    async openMissingFacilitiesModal() {
      const itemsWithMissingFacility = this.getItemsWithMissingFacility();
      const missingFacilitiesModal = await modalController.create({
        component: MissingFacilitiesModal,
        componentProps: { itemsWithMissingFacility, type: 'stock' }
      });
      return missingFacilitiesModal.present();
    },
    getSelectedItems(){
      return Object.values(this.stockItems.parsed).filter((item: any) => item.isSelected).length;
    },
    setFacilityLocation(ev: CustomEvent, product: any){
      this.stockItems.parsed.map((item: any) => { 
        if(item.pseudoId === product.pseudoId){
          item.locationSeqId = ev.detail.value;
        }
      });
      this.store.dispatch('stock/updateStockItems', this.stockItems);
    },
    async save(){
      const uploadData = this.stockItems.parsed.map((item: any) => {
        return {
          "facilityId": item.facilityId,
          "externalFacilityId": item.externalFacilityId,
          "idValue": item.identification,
          "idType": item.identificationTypeId,
          "locationSeqId": item.locationSeqId,
          "availableQty": item.quantity
        };
      })
      const fileName = this.fileName.replace(".csv", ".json");
      const params = {
        "configId": "RESET_INVENTORY"
      }
      const alert = await alertController.create({
        header: this.$t("Reset inventory"),
        message: this.$t("Make sure all the data you have entered is correct."),
        buttons: [
            {
              text: this.$t("Cancel"),
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
                  this.isCsvUploadedSuccessfully = true;
                  showToast(translate("The inventory has been updated successfully"), [{
                    text: translate('View'),
                    role: 'view',
                    handler: () => {
                      window.open(`https://${this.instanceUrl}.hotwax.io/commerce/control/ImportData?configId=RESET_INVENTORY`, '_blank');
                    }
                  }])
                  this.router.push("/inventory");
                  this.store.dispatch('stock/clearStockItems');
                }).catch(() => {
                  showToast(translate("Something went wrong, please try again"));
                })
              },
            },
          ],
        });
      return alert.present();  
    },
    async openProductPopover(ev: Event, id: any, isVirtual: boolean, item: any, type: string) {
      const productPopover = await popoverController
        .create({
          component: ProductPopover,
          event: ev,
          translucent: true,
          showBackdrop: true,
          componentProps: { 'id': id, 'isVirtual': isVirtual, 'item': item, 'type': type }
        });
      return productPopover.present();
    },
    isParentProductChecked(parentProductId: string) {
      const items = this.getItemsByParentProduct(parentProductId, this.stockItems.parsed);
      return items.every((item: any) => item.isSelected)
    },
    revertAll() {
      this.stockItems.parsed = JSON.parse(JSON.stringify(this.stockItems.original));
      this.stockItems.initial = this.stockItems.parsed.slice(0, process.env['VUE_APP_VIEW_SIZE']);
      
      this.store.dispatch('stock/updateStockItems', this.stockItems);
    },
    getParentProductIds (items: any) {
      return Array.from(new Set(items.map((ele: any) => ele.parentProductId)));
    },
    getItemsByParentProduct(parentProductId: any, items: any) {
      return items.filter((item: any) => item.parentProductId == parentProductId)
    },
    getParentInformation(id: any, items: any) {
      return items.find((item: any) => item.parentProductId == id)
    },
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    
    return {
      businessOutline,
      calculatorOutline,
      chevronForwardOutline,
      checkboxOutline,
      ellipsisVerticalOutline,
      locationOutline,
      arrowUndoOutline,
      shirtOutline,
      cloudUploadOutline,
      warningOutline,
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

.list-item {
  --columns-tablet: 4;
  --columns-desktop: 6;
}

.list-item :first-child ion-label {
  word-break: break-all;
}

.list-header {
  background-color: var(--ion-color-light);
}

ion-chip > ion-select {
  padding: 0px;
}

.location {
  display: flex;
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