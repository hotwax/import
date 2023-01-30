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
          <ion-searchbar  :placeholder="$t('Search products')" v-model="queryString" v-on:keyup.enter="queryString = $event.target.value; searchProduct(queryString)"></ion-searchbar>
          <ion-chip outline @click="openMissingSkuModal()">
            <ion-label>{{ $t("Missing SKUs") }}</ion-label>
          </ion-chip>
        </div> 

        <div class="filters">
          <ion-item>
            <ion-label>{{ $t("Facility") }}</ion-label>
            <ion-select interface="popover" v-model="facilityId">
              <ion-select-option v-for="facility in facilities" :key="facility.facilityId" :value="facility.facilityId">{{ facility.facilityName }}</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-button expand="block" fill="outline" @click="apply">{{ $t("Apply") }}</ion-button>
        </div>
      </div>  

      <div v-if="searchedProduct?.pseudoId" class="list-item">
        <ion-item lines="none">
          <ion-thumbnail>
            <Image :src="searchedProduct.imageUrl" />
          </ion-thumbnail>
          <ion-label>
            {{ searchedProduct.pseudoId }}
          </ion-label>
        </ion-item>

        <ion-chip outline>
          <ion-label>{{ searchedProduct.quantity }} {{ $t("Items") }}</ion-label>
        </ion-chip>

        <ion-chip outline class="tablet">
          <ion-label>{{ searchedProduct.externalFacilityId }}</ion-label>
        </ion-chip>

        <ion-chip outline class="tablet">
          <ion-icon :icon="locationOutline" />
          <ion-select interface="popover" :value="searchedProduct.locationSeqId" @ionChange="setFacilityLocation($event, searchedProduct)">
            <ion-select-option v-for="facilityLocation in getFacilityLocationsByFacilityId(searchedProduct.externalFacilityId)" :key="facilityLocation.locationSeqId" :value="facilityLocation.locationSeqId" >{{ facilityLocation.locationSeqId }}</ion-select-option>
          </ion-select>
        </ion-chip>

        <!-- Used :key as the changed value was not reflected -->
        <ion-checkbox :key="searchedProduct.isSelected" :checked="searchedProduct.isSelected" @ionChange="selectProduct(searchedProduct, $event)"/>
        
        <ion-button fill="clear" color="medium" @click="openProductPopover($event, searchedProduct.pseudoId, false, searchedProduct, 'stock')">
          <ion-icon slot="icon-only" :icon="ellipsisVerticalOutline" />
        </ion-button>
      </div>

      <div v-else v-for="id in getParentProductIds(stock.parsed)" :key="id">
        <div class="list-item list-header">
          <ion-item color="light" lines="none">
            <ion-label>{{ getParentInformation(id, stock.parsed).parentProductName }}</ion-label>
          </ion-item>

          <div class="tablet" />

          <div class="tablet" />

          <div />
          
          <ion-checkbox :checked="isParentProductChecked(id)" @click="isParentProductUpdated = true" @ionChange="selectParentProduct(id, $event)" />

          <ion-button fill="clear" color="medium" @click="openProductPopover($event, id, true, getParentInformation(id, stock.parsed), 'stock')">
            <ion-icon slot="icon-only" :icon="ellipsisVerticalOutline" />
          </ion-button>
        </div>
        <div v-for="(item, index) in getItemsByParentProduct(id, stock.parsed)" :key="index">
          <div class="list-item">
            <ion-item lines="none">
              <ion-thumbnail slot="start">
                <Image :src="item.imageUrl" />
              </ion-thumbnail>
              <ion-label class="ion-text-wrap">
                {{ item.pseudoId }}
              </ion-label>
            </ion-item>

            <ion-chip outline>
              <ion-label>{{ item.quantity }} {{ $t("Items") }}</ion-label>
            </ion-chip>

            <ion-chip outline class="tablet">
              <ion-label>{{ item.externalFacilityId ? item.externalFacilityId : item.facilityId }}</ion-label>
            </ion-chip>
            <ion-chip outline class="tablet location">
              <ion-icon :icon="locationOutline" />
              <ion-select interface="popover" :value="item.locationSeqId" @ionChange="setFacilityLocation($event, item)">
                <ion-select-option v-for="facilityLocation in getFacilityLocationsByFacilityId(item.externalFacilityId ? item.externalFacilityId : item.facilityId)" :key="facilityLocation.locationSeqId" :value="facilityLocation.locationSeqId" >{{ facilityLocation.locationSeqId }}</ion-select-option>
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
import { OrderService } from "@/services/OrderService";
import Image from '@/components/Image.vue';
import ProductPopover from '@/components/ProductPopover.vue'
import { defineComponent } from 'vue';
import { mapGetters, useStore } from "vuex";
import { useRouter } from 'vue-router';
import { showToast, hasError } from '@/utils';
import { translate } from "@/i18n";
import { IonPage, IonHeader, IonToolbar, IonBackButton, IonContent, IonSearchbar, IonItem, IonThumbnail, IonLabel, IonChip, IonIcon, IonButton, IonCheckbox, IonSelect, IonSelectOption, IonButtons, popoverController, IonFab, IonFabButton, alertController, modalController } from '@ionic/vue'
import { ellipsisVerticalOutline, locationOutline, checkboxOutline, cloudUploadOutline, arrowUndoOutline } from 'ionicons/icons'
import MissingSkuModal from "@/components/MissingSkuModal.vue"

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
    IonFabButton
  },
  computed: {
    ...mapGetters({
      stock: 'stock/getItemsStock',
      getProduct: 'product/getProduct',
      instanceUrl: 'user/getInstanceUrl',
      fileName: 'order/getFileName',
      getFacilityLocationsByFacilityId: 'user/getFacilityLocationsByFacilityId'
    })
  },
  data() {
    return {
      facilityId: (this as any)?.stock?.parsed[0]?.facilityId,
      facilities: [] as any,
      queryString: "",
      searchedProduct: {} as any,
      isParentProductUpdated: false,
      isPOUploadedSuccessfully: false,
      facilityLocations: {}
    }
  },
  ionViewDidEnter(){
    this.fetchFacilities();
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
    if(!this.isPOUploadedSuccessfully){
      alert.present();
      await alert.onDidDismiss();
      this.isPOUploadedSuccessfully = false;
      return canLeave;
    }
  },
  
  methods: {
    setFacilityLocation(ev: CustomEvent, product: any){
      this.stock.parsed.map((item: any) => { 
        if(item.pseudoId === product.pseudoId){
          item.locationSeqId = ev.detail.value;
        }
      });
      this.store.dispatch('stock/updatedStockListItems', this.stock.parsed);
    },
    async openMissingSkuModal() {
      const missingSkuModal = await modalController.create({
        component: MissingSkuModal,
        componentProps: { 'unidentifiedProductItems': this.stock.unidentifiedItems }
      });
      return missingSkuModal.present();
    }, 
    searchProduct(sku: any) {
      const product = this.getProduct(sku);
      this.searchedProduct = this.stock.parsed.find((item: any) => {
        return item.pseudoId === product.pseudoId;
      })
    },
    async save(){
      const uploadData = this.stock.parsed.filter((item: any) => {
        return item.isSelected;
      }).map((item: any) => {
        return {
          "facilityId": item.facilityId,
          "externalFacilityId": item.externalFacilityId,
          "idValue": item.productSKU,
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
                  this.isPOUploadedSuccessfully = true;
                  showToast(translate("The inventory has been updated successfully"), [{
                    text: translate('View'),
                    role: 'view',
                    handler: () => {
                      window.open(`https://${this.instanceUrl}.hotwax.io/commerce/control/ImportData?configId=RESET_INVENTORY`, '_blank');
                    }
                  }])
                  this.router.push("/inventory");
                  this.store.dispatch('stock/clearStockList');
                }).catch(() => {
                  showToast(translate("Something went wrong, please try again"));
                })
              },
            },
          ],
        });
      return alert.present();  
    },
    async fetchFacilities(){
      const payload = {
        "inputFields": {
          "parentTypeId": "VIRTUAL_FACILITY",
          "parentTypeId_op": "notEqual",
          "facilityTypeId": "VIRTUAL_FACILITY",
          "facilityTypeId_op": "notEqual",
        },
        "fieldList": ["facilityId", "facilityName", "parentTypeId"],
        "viewSize": 50,
        "entityName": "FacilityAndType",
        "noConditionFind": "Y"
      }
      try {
        const resp = await OrderService.getFacilities(payload);
        if(resp.status === 200 && !hasError(resp)){
          this.facilities = resp.data.docs;
        }
      } catch(err) {
        console.error(err)
      }
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
      const items = this.getItemsByParentProduct(parentProductId, this.stock.parsed);
      return items.every((item: any) => item.isSelected)
    },
    selectProduct(item: any, event: any) {
      item.isSelected = event.detail.checked;
    },
    revertAll() {
      const original = JSON.parse(JSON.stringify(this.stock.original));
      this.store.dispatch('stock/updatedStockListItems', original);
    },
    async apply() {
      if(this.facilityId) {
        const facilityLocations = await this.store.dispatch('user/fetchFacilityLocations', [this.facilityId]);
        await this.stock.parsed.map((item: any) => {
          if (item.isSelected) {
            item.facilityId = this.facilityId;
            //TODO: Need to improve the handling of locationSeqId.
            item.locationSeqId = facilityLocations && facilityLocations[0] && facilityLocations[0].locationSeqId ? facilityLocations[0].locationSeqId : "";
            item.externalFacilityId = "";
          }
        })
      }
      await this.store.dispatch('stock/updatedStockListItems', this.stock.parsed);
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
      this.stock.parsed.forEach((item: any) => {
        item.isSelected = true;
      })
    },
    selectParentProduct(parentProductId: any, event: any) {
      // Todo: Need to find a better approach.
      if(this.isParentProductUpdated){
        this.stock.parsed.forEach((item: any) => {
          if (item.parentProductId === parentProductId) {
            item.isSelected = event.detail.checked;
          }
        })
        this.isParentProductUpdated = false;
      }
    }
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    
    return {
      checkboxOutline,
      ellipsisVerticalOutline,
      locationOutline,
      arrowUndoOutline,
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