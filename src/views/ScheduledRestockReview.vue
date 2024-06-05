<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/scheduled-restock" />
        <ion-title>{{ translate("Restock details")}}</ion-title>
        <ion-buttons slot="end">
          <ion-button :disabled="!areAnyItemsUnchecked()" @click="selectAllItems">
            <ion-icon slot="icon-only" :icon="checkboxOutline"/>
          </ion-button>
          <!-- <ion-button >
            <ion-icon slot="icon-only" :icon="arrowUndoOutline" />
          </ion-button> -->
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <div class="header">
        <div class="search">
          <ion-searchbar :placeholder="translate('Search products')" @keyup.enter="queryString = $event.target.value; searchProducts(queryString)"/>
        </div>
        <div class="filters">
          <ion-list>
            <ion-item>
              <ion-icon slot="start" :icon="timerOutline"/>
              <ion-label>{{ translate("Schedule") }}</ion-label>  
              <ion-button class="date-time-button" slot="end" @click="updateTime()">{{ schedule.scheduledTime ? getTime(schedule.scheduledTime) : translate("Select time") }}</ion-button> 
              <ion-modal class="date-time-modal" :is-open="isDateTimeModalOpen" @didDismiss="() => isDateTimeModalOpen = false">
                <ion-content force-overscroll="false">
                  <ion-datetime    
                    id="schedule-datetime"        
                    show-default-buttons 
                    hour-cycle="h23"
                    presentation="date-time"
                    :value="schedule.scheduledTime ? getDateTime(schedule.scheduledTime) : getDateTime(DateTime.now().toMillis())"
                    @ionChange="updateCustomTime($event)"
                  />
                </ion-content>
              </ion-modal>     
            </ion-item>
            <ion-item>
              <ion-icon slot="start" :icon="businessOutline"/>
              <ion-select :label="translate('Facility')" interface="popover" :placeholder = "translate('Select')" v-model="schedule.facilityId">
                <ion-select-option v-for="facility in facilities" :key="facility.facilityId" :value="facility.externalId">
                  {{ facility.facilityName || facility.facilityId }}
                </ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item>
              <ion-icon slot="start" :icon="globeOutline"/>
              <ion-select :label="translate('Product store')" interface="popover" :value="schedule.productStoreId" @ionChange="updateProductStore($event)">
                <ion-select-option v-for="productStore in productStores" :key="productStore.productStoreId" :value="productStore.productStoreId">
                  {{ productStore.storeName || productStore.productStoreId }}
                </ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item>
              <ion-select :disabled="!schedule.productStoreId" :label="translate('Shopify store')" interface="popover" :placeholder = "translate('Select')" v-model="schedule.shopId">
                <ion-select-option v-for="shop in shopifyShops" :key="shop.shopId" :value="shop.shopId">
                  {{ shop.name ? shop.name : shop.shopId }}
                </ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item lines="none">
              <ion-input :label="translate('Restock name')" :placeholder="getPlaceholder()" v-model="schedule.restockName"></ion-input>
            </ion-item>
          </ion-list>
        </div>
      </div>
      <div v-if="!parsedItems.length">
        <p>{{ translate("No product found") }}</p>
      </div>
      <div v-else>
        <div class="list-item" v-for="(item , index) in parsedItems" :key="index">
          <ion-item lines="none">
            <ion-thumbnail>
              <DxpShopifyImg :src="item.imageUrl" size="small" />
            </ion-thumbnail>
            <ion-label>
              <h2>{{ item.parentProductName }}</h2>
              <p>{{ item.identification }}</p>
            </ion-label>
          </ion-item>
          <ion-chip outline class="tablet">
            <ion-label>{{ item.quantity }} incoming</ion-label>
          </ion-chip>
          <ion-checkbox :checked="item.isSelected" @ion-change="selectListItem(item)"/>
        </div>
      </div>
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="save" :disabled="!parsedItems.length">
          <ion-icon :icon="cloudUploadOutline" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>
  
<script>
import { defineComponent } from "vue";
import { IonBackButton, IonButton, IonButtons, IonCheckbox, IonChip, IonContent, IonDatetime, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonModal, IonPage, IonSearchbar, IonSelect, IonSelectOption, IonThumbnail, IonTitle, IonToolbar, alertController} from "@ionic/vue";
import { DxpShopifyImg, translate } from "@hotwax/dxp-components";
import { arrowUndoOutline, checkboxOutline, timerOutline, businessOutline, cloudUploadOutline, globeOutline} from "ionicons/icons"
import { mapGetters, useStore } from "vuex";
import { DateTime } from 'luxon';
import { showToast } from '@/utils';
import { UploadService } from "@/services/UploadService";
import { hasError } from "@/adapter";
import logger from "@/logger";
import { UtilService } from '@/services/UtilService'
import emitter from "@/event-bus";
import { useRouter } from "vue-router";


export default defineComponent({
  name: 'ScheduledRestockDetail',
  components: {
    DxpShopifyImg,
    IonBackButton,
    IonButton,
    IonButtons,
    IonCheckbox,
    IonChip,
    IonContent,
    IonDatetime,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonModal,
    IonPage,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonThumbnail,
    IonTitle,
    IonToolbar
  },
  computed: {
    ...mapGetters({
      restockItems: 'stock/getRestockItems',
      facilities: 'util/getFacilities',
      userProfile: 'user/getUserProfile',
      fileName: 'order/getFileName',
      schedule: 'stock/getScheduledInformation',
      productStores: 'util/getProductStores'
    })
  },
  data() {
    return {
      isCsvUploadedSuccessfully: false,
      originalItems: [],
      parsedItems: [],
      isDateTimeModalOpen: false,
      shopifyShops: []
    }
  },

  async ionViewDidEnter() {
    await this.store.dispatch('util/fetchFacilities');
    this.getRestockItems();
    if(this.schedule.productStoreId) {
      this.fetchShopifyShops(this.schedule.productStoreId);
    }
  },
  // async beforeRouteLeave(to) { 
  //   if(to.path === "/login" ) return;
  //   let canLeave = false;
  //   const alert = await alertController.create({
  //     header: translate("Leave page"),
  //     message: translate("Any edits made on this page will be lost."),
  //     buttons: [
  //       {
  //         text: translate("STAY"),
  //         handler: () => {
  //           canLeave = false;
  //         },
  //       },
  //       {
  //         text: translate("LEAVE"),
  //         handler: () => {
  //           canLeave = true;
  //         },
  //       },
  //     ],
  //   });
  //   if(!this.isCsvUploadedSuccessfully){
  //     alert.present();
  //     await alert.onDidDismiss();
  //     return canLeave;
  //   } else {
  //     this.isCsvUploadedSuccessfully = false;
  //   }
  // },
  methods: {
    getPlaceholder() {
      return `Created ${this.getTime(this.schedule.scheduledTime ? this.schedule.scheduledTime : DateTime.now().toMillis())}`
    },
    getRestockItems() {
      this.originalItems = this.restockItems;
      this.parsedItems = JSON.parse(JSON.stringify(this.originalItems))
    },
    updateTime() {
      this.isDateTimeModalOpen = true
    },
    getTime(time) {
      return DateTime.fromMillis(time, { setZone: true}).toFormat("hh:mm a dd MMM yyyy")
    },
    updateCustomTime(event) {
      const currentTime = DateTime.now().toMillis();
      const setTime = DateTime.fromISO(event.detail.value).toMillis();
      if (setTime < currentTime) {
        showToast(translate("Please provide a future date and time"));
        return;
      }
      this.schedule.scheduledTime = setTime;
    },
    async save() {
      if(!this.schedule.scheduledTime) {
        showToast(translate("Please select a schedule time"));
        return;
      }
      
      if(!this.schedule.facilityId) {
        showToast(translate("Please select a facility"));
        return;
      }
      
      if(!this.schedule.productStoreId) {
        showToast(translate("Please select a product store"));
        return;
      }

      if(!this.schedule.shopId) {
        showToast(translate("Please select a shopify shop"));
        return;
      }

      const items = this.parsedItems.filter(item => item.isSelected).map(({ productId, quantity }) => ({ productId, quantity }));
      const destinationFacilityId = this.schedule.facilityId;

      const uploadData = {
        payload: {
          externalDestinationFacilityId: destinationFacilityId,
          items: items
        }
      };

      const alert = await alertController.create({
        header: translate("Reset inventory"),
        message: translate("Make sure all the data you have entered is correct."),
        buttons: [
          {
            text: translate("Cancel"),
            role: 'cancel',
          },
          {
            text: translate("Upload"),
            handler: async () => {
              emitter.emit("presentLoader")
              try {
                const resp = await UploadService.createIncomingShipment(uploadData)
                if(!hasError(resp) && resp.data.shipmentId) {
                  await this.store.dispatch("stock/scheduleService", { 
                    params: {
                      shipmentId: resp.data.shipmentId,
                      shopId: this.schedule.shopId,
                      productStoreId: this.schedule.productStoreId
                    },
                    restockName: this.schedule.restockName,
                    scheduledTime: this.schedule.scheduledTime,
                  })
                } else {
                  throw resp.data;
                }
              } catch(err) {
                showToast(translate("Failed to schedule job"))
                logger.error('Failed to create shipment', err)
              }
              emitter.emit("dismissLoader")
              this.router.push('/scheduled-restock')
            }
          },
        ],
      });
      return alert.present();  
    },
    selectListItem(item) {
      item.isSelected = !item.isSelected;
    },
    selectAllItems() {
      this.parsedItems = this.parsedItems.map(item => {
        return { ...item, isSelected: true };
      });
    },
    areAnyItemsUnchecked() {
      return this.parsedItems.some(item => !item.isSelected);
    },
    searchProducts(query) {
      if (!query) {
        this.parsedItems = JSON.parse(JSON.stringify(this.originalItems));
        return;
      }
      const filteredItems = this.originalItems.filter(item => {
        return item.parentProductId.includes(query) ||
          item.productId.includes(query) ||
          item.parentProductName.toLowerCase().includes(query.toLowerCase()) ||
          item.identification.toLowerCase().includes(query.toLowerCase());
      });
      if (filteredItems.length == 0) {
        showToast(translate("No product found"));
      }
      this.parsedItems = filteredItems;
    },

    updateProductStore(event) {
      this.schedule.shopId = ''
      this.schedule.productStoreId = event.detail.value;
      this.fetchShopifyShops(this.schedule.productStoreId);
    },
    async fetchShopifyShops(productStoreId) {
      let shopifyShops = []
      try {
        const resp = await UtilService.fetchShopifyShop({
          entityName: "ShopifyShop",
          inputFields: {
            productStoreId
          },
          viewSize: 100
        })

        if (!hasError(resp)) {
          shopifyShops = resp.data.docs
        } else {
          throw resp.data
        }
      } catch (error) {
        logger.error('Failed to fetch shopify shops.', error)
      }
      this.shopifyShops = shopifyShops
      this.schedule.shopId = this.shopifyShops[0].shopId ? this.shopifyShops[0].shopId : '';
    },
    getDateTime(time) {
      return DateTime.fromMillis(time).toISO()
    },
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    return {
      translate,
      arrowUndoOutline,
      checkboxOutline,
      timerOutline,
      businessOutline,
      store,
      cloudUploadOutline,
      DateTime,
      globeOutline,
      router
    }
  }
})
</script>
  
<style scoped>
.list-header {
  background-color: var(--ion-color-light);
}

.list-item {
  --columns-desktop: 4;
  --columns-tablet: 4;
}

.list-item > ion-item {
  width: 100%;
}

.list-item :first-child ion-label {
  word-break: break-all;
}

.list-item > *:last-child {
  display: unset;
  justify-self: unset;
}

.header {
  display: grid;
  grid: "search filters"
        /1fr 1fr;
}

.search {
  grid-area: search;
}

.filters {
  grid-area: filters;
}

ion-content {
  --padding-bottom: 80px;
}

@media (max-width: 991px) {
  .header {
    grid: "search"
          "filters"
          / auto;
    padding: 0;
  }
}
</style>