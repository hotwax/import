<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/inventory" />
        <ion-buttons slot="end">
          <ion-button @click="selectAllItems">
            <ion-icon slot="icon-only" :icon="checkboxOutline" />
          </ion-button>
          <ion-button @click="revertAll">
            <ion-icon slot="icon-only" :icon="arrowUndoOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content >
      <div class="header">
        <div class="search">
          <ion-searchbar  :placeholder="$t('Search products')" v-model="queryString" v-on:keyup.enter="queryString = $event.target.value; searchProduct(queryString)" />
        </div>

        <div class="filters">
          <ion-item @click="openBulkInventoryAdjustmentModal()" button> 
            <ion-icon slot="start" :icon="calculatorOutline" />
            <ion-label>{{ $t("Bulk adjustment") }}</ion-label>
            <ion-note slot="end">{{ getSelectedItems() }} {{ $t("items selected") }}</ion-note>
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
            <ion-note slot="end">{{ stockItems.unidentifiedItems.length }} {{ $t("items") }}</ion-note>
            <ion-icon slot="end" :icon="chevronForwardOutline" />
          </ion-item>
        </div>
      </div>  

      <div v-if="searchedProduct?.pseudoId" class="list-item">
        <ion-item lines="none">
          <ion-thumbnail>
            <Image :src="searchedProduct.imageUrl" />
          </ion-thumbnail>
          <ion-label class="ion-text-wrap">
            <h3>{{ searchedProduct.pseudoId }}</h3>
            <p>{{ searchedProduct.initialSKU }}</p>
          </ion-label>
        </ion-item>

        <ion-chip outline>
          <ion-label>{{ searchedProduct.quantity }} {{ $t("Items") }}</ion-label>
        </ion-chip>

        <ion-chip outline class="tablet">
          <ion-label>{{ searchedProduct.externalFacilityId ? searchedProduct.externalFacilityId : searchedProduct.facilityId }}</ion-label>
        </ion-chip>

        <ion-chip outline class="tablet location">
          <ion-icon :icon="locationOutline" />
          <ion-select interface="popover" :value="searchedProduct.locationSeqId" @ionChange="setFacilityLocation($event, searchedProduct)">
            <ion-select-option v-for="facilityLocation in getFacilityLocationsByFacilityId(searchedProduct.externalFacilityId ? searchedProduct.externalFacilityId : searchedProduct.facilityId)" :key="facilityLocation.locationSeqId" :value="facilityLocation.locationSeqId" >{{ facilityLocation.locationSeqId }}</ion-select-option>
          </ion-select>
        </ion-chip>

        <!-- Used :key as the changed value was not reflected -->
        <ion-checkbox :key="searchedProduct.isSelected" :checked="searchedProduct.isSelected" @ionChange="selectProduct(searchedProduct, $event)"/>
        
        <ion-button fill="clear" color="medium" @click="openProductPopover($event, searchedProduct.pseudoId, false, searchedProduct, 'stock')">
          <ion-icon slot="icon-only" :icon="ellipsisVerticalOutline" />
        </ion-button>
      </div>

      <div v-else v-for="id in getParentProductIds(stockItems.parsed)" :key="id">
        <div class="list-item list-header">
          <ion-item color="light" lines="none">
            <ion-label>{{ getParentInformation(id, stockItems.parsed).parentProductName }}</ion-label>
          </ion-item>

          <div class="tablet" />

          <div class="tablet" />

          <div />
          
          <ion-checkbox :checked="isParentProductChecked(id)" @click="isParentProductUpdated = true" @ionChange="selectParentProduct(id, $event)" />

          <ion-button fill="clear" color="medium" @click="openProductPopover($event, id, true, getParentInformation(id, stockItems.parsed), 'stock')">
            <ion-icon slot="icon-only" :icon="ellipsisVerticalOutline" />
          </ion-button>
        </div>
        <div v-for="(item, index) in getItemsByParentProduct(id, stockItems.parsed)" :key="index">
          <div class="list-item">
            <ion-item lines="none">
              <ion-thumbnail slot="start">
                <Image :src="item.imageUrl" />
              </ion-thumbnail>
              <ion-label class="ion-text-wrap">
                <h3>{{ item.pseudoId }}</h3>
                <p>{{ item.initialSKU }}</p>
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
              <ion-select interface="popover" :value="item.locationSeqId" @ionChange="setFacilityLocation($event, item)">
                <ion-select-option v-for="facilityLocation in getFacilityLocationsByFacilityId(item.facilityId ? item.facilityId : item.externalFacilityId)" :key="facilityLocation.locationSeqId" :value="facilityLocation.locationSeqId" >{{ facilityLocation.locationPath }}</ion-select-option>
              </ion-select>
            </ion-chip>

            <!-- Used :key as the changed value was not reflected -->
            <ion-checkbox :key="item.isSelected" :checked="item.isSelected" @ionChange="selectProduct(item, $event)"/>
            
            <ion-button fill="clear" color="medium" @click="openProductPopover($event, item.pseudoId, false, item, 'stock')">
              <ion-icon slot="icon-only" :icon="ellipsisVerticalOutline" />
            </ion-button>
          </div>
        </div>
      </div>

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
import Image from '@/components/Image.vue';
import ProductPopover from '@/components/ProductPopover.vue'
import BulkInventoryAdjustmentModal from '@/components/BulkInventoryAdjustmentModal.vue'
import MissingFacilitiesModal from '@/components/MissingFacilitiesModal.vue'
import MissingSkuModal from "@/components/MissingSkuModal.vue"
import { defineComponent } from 'vue';
import { mapGetters, useStore } from "vuex";
import { useRouter } from 'vue-router';
import { showToast } from '@/utils';
import { translate } from "@/i18n";
import { IonPage, IonHeader, IonToolbar, IonBackButton, IonContent, IonSearchbar, IonItem, IonThumbnail, IonLabel, IonChip, IonIcon, IonButton, IonCheckbox, IonSelect, IonSelectOption, IonButtons, popoverController, IonFab, IonFabButton, modalController, alertController, IonNote } from '@ionic/vue'
import { businessOutline, calculatorOutline, chevronForwardOutline, ellipsisVerticalOutline, locationOutline, shirtOutline, checkboxOutline, cloudUploadOutline, arrowUndoOutline } from 'ionicons/icons'

export default defineComponent({
  name: 'InventoryDetail',
  components: {
    Image,
    IonPage,
    IonHeader,
    IonToolbar,
    IonBackButton,
    IonContent,
    IonSearchbar,
    IonItem,
    IonThumbnail,
    IonLabel,
    IonChip,
    IonIcon,
    IonButton,
    IonCheckbox,
    IonSelect,
    IonSelectOption,
    IonButtons,
    IonFab,
    IonFabButton,
    IonNote
  },
  computed: {
    ...mapGetters({
      stockItems: 'stock/getStockItems',
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
      queryString: "",
      searchedProduct: {} as any,
      isParentProductUpdated: false,
      isCsvUploadedSuccessfully: false,
      facilityLocations: {}
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
    async openMissingSkuModal() {
      const missingSkuModal = await modalController.create({
        component: MissingSkuModal,
        componentProps: { 'unidentifiedItems': this.stockItems.unidentifiedItems, type: 'stock' }
      });
      missingSkuModal.onDidDismiss().then(() => {
        this.searchProduct(this.queryString);
      });
      return missingSkuModal.present();
    },
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
      missingFacilitiesModal.onDidDismiss().then(() => {
        this.searchProduct(this.queryString);
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
    searchProduct(sku: any) {
      const product = this.getProduct(sku);
      this.searchedProduct = this.stockItems.parsed.find((item: any) => {
        return item.pseudoId === product.pseudoId;
      })
    },
    async save(){
      const uploadData = this.stockItems.parsed.filter((item: any) => {
        return item.isSelected;
      }).map((item: any) => {
        return {
          "facilityId": item.facilityId,
          "externalFacilityId": item.externalFacilityId,
          "idValue": item.shopifyProductSKU,
          "idType": "SKU",
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
        productPopover.onDidDismiss().then(() => {
          this.searchProduct(this.queryString);
        });
      return productPopover.present();
    },
    isParentProductChecked(parentProductId: string) {
      const items = this.getItemsByParentProduct(parentProductId, this.stockItems.parsed);
      return items.every((item: any) => item.isSelected)
    },
    selectProduct(item: any, event: any) {
      item.isSelected = event.detail.checked;
      this.store.dispatch('stock/updateStockItems', this.stockItems)
    },
    revertAll() {
      this.stockItems.parsed = JSON.parse(JSON.stringify(this.stockItems.original));
      
      this.store.dispatch('stock/updateStockItems', this.stockItems);
      if(this.queryString) this.searchProduct(this.queryString);
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
    selectAllItems() {
      this.stockItems.parsed.forEach((item: any) => {
        item.isSelected = true;
      })
      this.store.dispatch('stock/updateStockItems', this.stockItems)
    },
    selectParentProduct(parentProductId: any, event: any) {
      // Todo: Need to find a better approach.
      if(this.isParentProductUpdated){
        this.stockItems.parsed.forEach((item: any) => {
          if (item.parentProductId === parentProductId) {
            item.isSelected = event.detail.checked;
          }
        })
        this.isParentProductUpdated = false;
      }
      this.store.dispatch('stock/updateStockItems', this.stockItems);
    },
    async openBulkInventoryAdjustmentModal() {
      const bulkInventoryAdjustmentModal = await modalController.create({
        component: BulkInventoryAdjustmentModal,
      });
      bulkInventoryAdjustmentModal.onDidDismiss().then(() => {
        this.searchProduct(this.queryString);
      });
      return bulkInventoryAdjustmentModal.present();
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