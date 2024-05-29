<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/scheduled-restock" />
        <ion-title>Restock details</ion-title>

        <ion-buttons slot="end">
          <ion-button :disabled="!areAnyItemsUnchecked()" @click="selectAllItems">
            <ion-icon slot="icon-only" :icon="checkboxOutline"/>
          </ion-button>
          <ion-button >
            <ion-icon slot="icon-only" :icon="arrowUndoOutline" />
          </ion-button>
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
              <ion-label> Schedule </ion-label>  
              <ion-button slot="end" color="light">{{ schedule.scheduledTime ? getTime(schedule.scheduledTime) : getTime(DateTime.now().toMillis())}}</ion-button>      
            </ion-item>
            <ion-item>
              <ion-icon slot="start" :icon="businessOutline"/>
              <ion-select label="Facilities" interface="popover" :placeholder = "translate('Select')">
              <ion-select-option v-for="(facilityItems, facilityId) in parsedItems" :key="facilityId">{{ getFacilityName(facilityId) }}</ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item>
              <ion-icon slot="start" :icon="globeOutline"/>
              <ion-select label="Shopify Store" interface="popover" :placeholder = "translate('Select')">
              <ion-select-option :value="schedule.shopId" v-for="shop in shopifyShops" :key="shop.shopId">
                {{ shop.name ? shop.name : shop.shopId }}
              </ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item lines="none">
              <ion-input label="Restock name" placeholder="name" v-model="restockName"></ion-input>
            </ion-item>
          </ion-list>
        </div>
      </div>
      
      <div v-for="(facilityItems, facilityId) in parsedItems" :key="facilityId">
        <div class="list-item list-header">
          <ion-item color="light" lines="none">
            <ion-label>{{ getFacilityName(facilityId) }}</ion-label>
          </ion-item>
        </div>

        <div class="list-item" v-for="(item , index) in facilityItems" :key="index">
          <ion-item lines="none">
            <ion-thumbnail>
              <DxpShopifyImg :src="item.imageUrl" size="small" />
            </ion-thumbnail>
            <ion-label>
              <p>{{ item.parentProductName }}</p>
            </ion-label>
          </ion-item>
  
          <ion-chip outline class="tablet">
            <ion-label>{{ item.quantity }} incoming</ion-label>
          </ion-chip>
          
          <ion-checkbox :checked="item.isSelected" @ion-change="selectListItem(item)"/>
        </div>
      </div>
      <ion-fab ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="save">
          <ion-icon :icon="cloudUploadOutline" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>
  
<script>
import { defineComponent } from "vue";
import { IonBackButton, IonButton, IonButtons, IonCheckbox, IonChip, IonContent,IonFab,IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSearchbar, IonSelect, IonSelectOption, IonThumbnail, IonTitle, IonToolbar, alertController} from "@ionic/vue";
import { translate } from "@hotwax/dxp-components";
import { DxpShopifyImg } from "@hotwax/dxp-components";
import { arrowUndoOutline, checkboxOutline, timerOutline, businessOutline, cloudUploadOutline, globeOutline} from "ionicons/icons"
import { mapGetters, useStore } from "vuex";
import { DateTime } from 'luxon';
import { jsonToCsv, showToast } from '@/utils';
import { UploadService } from "@/services/UploadService";
import { hasError } from "@/adapter";
import logger from "@/logger";

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
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
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
      shopifyShops: 'stock/getShopifyShops'
    })
  },
  data() {
    return {
      isCsvUploadedSuccessfully: false,
      originalItems: {},
      parsedItems: {},
      restockName: ''
    }
  },

  async ionViewDidEnter() {
    await this.store.dispatch('util/fetchFacilities');
    this.getFilteredRestockItems();
    this.restockName = this.schedule.restockName
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
    getFilteredRestockItems() {
      const filteredItems = {};
      
      this.restockItems.map((item) => {
        if(filteredItems[item.externalFacilityId]) filteredItems[item.externalFacilityId].push(item)
        else filteredItems[item.externalFacilityId] = [item];
      })
      this.originalItems = filteredItems;
      this.parsedItems = JSON.parse(JSON.stringify(this.originalItems))
    },

    getFacilityName(externalFacilityId) {
      const facility = this.facilities.find(fac => fac.externalId === externalFacilityId);
      return facility ? facility.facilityName : externalFacilityId;
    },
    getTime(time) {
      return DateTime.fromMillis(time, { setZone: true}).toFormat("hh:mm a dd MMM yyyy")
    },
    async save(){
      const groupedItems = Object.keys(this.parsedItems).reduce((result, key) => {
        const items = this.parsedItems[key];
        items.forEach(item => {
          if (!result[item.externalFacilityId]) {
            result[item.externalFacilityId] = [];
          }

          result[item.externalFacilityId].push({
            productId: item.productId,
            quantity: parseInt(item.quantity, 10)
          });
        });

        return result;
      }, {});

      const destinationFacilityId = Object.keys(groupedItems)[0];
      const items = groupedItems[destinationFacilityId];

      const uploadData = {
        payload: {
          destinationFacilityId: destinationFacilityId,
          items: items
        }
      };
      console.log(uploadData);

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
                try{
                  const resp = await UploadService.createIncomingShipment(uploadData)
                  if(!hasError(resp) && resp.data.shipmentId) {
                    this.store.dispatch("stock/scheduleService", { params: {
                      shipmentId: resp.data.shipmentId,
                      shopId: this.schedule.shopId
                    },
                    restockName: this.restockName
                   })
                  } else {
                    throw resp.data;
                  }
                } catch(err) {
                  showToast(translate("Failed to create shipment"))
                  console.error(err)
                }
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
      for (const facilityId in this.parsedItems) {
      this.parsedItems[facilityId].forEach(item => {
        item.isSelected = true;
      });
    }
    },
    
    areAnyItemsUnchecked() {
      return Object.values(this.parsedItems).some(facilityItems => 
      facilityItems.some(item => !item.isSelected));
    },
    searchProducts(query) {
      if (!query) {
        this.parsedItems = JSON.parse(JSON.stringify(this.originalItems));
        return;
      }
      const filteredItems = {};
      for (const facilityId in this.originalItems) {
        filteredItems[facilityId] = this.originalItems[facilityId].filter(item => {
          return item.parentProductId.includes(query) ||
                 item.productId.includes(query) ||
                 item.parentProductName.toLowerCase().includes(query.toLowerCase()) ||
                 item.product.toLowerCase().includes(query.toLowerCase());
        });
      }
      const noItemsFound = !Object.values(filteredItems).some(items => items.length > 0);
      if(noItemsFound) {
        showToast("No product found")
      }
      this.parsedItems = filteredItems;
    }
  },
  setup() {
    const store = useStore();

    return {
      translate,
      arrowUndoOutline,
      checkboxOutline,
      timerOutline,
      businessOutline,
      store,
      cloudUploadOutline,
      DateTime,
      globeOutline
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

@media (max-width: 991px) {
  .header {
    grid: "search"
          "filters"
          / auto;
    padding: 0;
  }
}
</style>
