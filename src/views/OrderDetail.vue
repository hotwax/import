<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/purchase-order" />
        <ion-title>{{ $t("Review purchase order") }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="selectAllItems">
            <ion-icon slot="icon-only" :icon="checkboxOutline" />
          </ion-button>
          <ion-button @click="revertAll">
            <ion-icon :icon="arrowUndoOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content >
      <div class="header">
        <div class="search">
          <ion-searchbar  :placeholder="$t('Search products')" v-model="queryString" v-on:keyup.enter="queryString = $event.target.value; searchProduct(queryString)"></ion-searchbar>
          <ion-chip outline @click="listMissingSkus()">
            <ion-label>{{ $t("Missing SKUs") }}</ion-label>
          </ion-chip>
        </div> 

        <div class="filters">
          <ion-item>
            <ion-label>{{ $t("Buffer days") }}</ion-label>
            <ion-input v-model="numberOfDays" type="number" :placeholder = "$t('Lead time')" /> 
          </ion-item>

          <ion-item>
            <ion-label>{{ $t("Order buffer") }}</ion-label>
            <ion-input v-model="numberOfPieces" type="number" :placeholder = "$t('Safety stock')" />
          </ion-item>

          <ion-item>
            <ion-label>{{ $t("Catalog") }}</ion-label>
            <ion-select interface="popover" v-model="catalog">
              <ion-select-option value="N">{{ $t("Backorder") }}</ion-select-option>
              <ion-select-option value="Y">{{ $t("Preorder") }}</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label>{{ $t("Facility") }}</ion-label>
            <ion-select interface="popover" v-model="facilityId">
              <ion-select-option v-for="facility in facilities" :key="facility" :value="facility.facilityId">{{ facility.facilityName }}</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-button expand="block" fill="outline" @click="apply">{{ $t("Apply") }}</ion-button>
        </div>
      </div>  

      <div v-if="searchedProduct?.internalName" class="list-item">
        <ion-item  lines="none">
          <ion-thumbnail>
            <Image :src="searchedProduct.imageUrl" />
          </ion-thumbnail>
          <ion-label>
            {{ searchedProduct.internalName }}
          </ion-label>
        </ion-item>

        <ion-chip outline>
          <ion-label>{{ searchedProduct.isNewProduct === "Y"? $t("Preorder") : $t("Backorder") }}</ion-label>
        </ion-chip>

        <ion-chip outline>
          <ion-label>{{ searchedProduct.quantityOrdered }} {{ $t("Ordered") }}</ion-label>
        </ion-chip>

        <ion-chip outline>
          <ion-icon :icon="sendOutline" />
          <ion-label>{{ searchedProduct.arrivalDate }}</ion-label>
        </ion-chip>

        <!-- Used :key as the changed value was not reflected -->
        <ion-checkbox :key="searchedProduct.isSelected" :checked="searchedProduct.isSelected" @ionChange="selectProduct(searchedProduct, $event)"/>
        
        <ion-button fill="clear" color="medium" @click="UpdateProduct($event, searchedProduct.internalName, false, searchedProduct, searchedProduct.orderId)">
          <ion-icon slot="icon-only" :icon="ellipsisVerticalOutline" />
        </ion-button>
      </div>

      <div v-for="(orderItems, index) in ordersList" :key="index">
      <h3>{{ index }}</h3>
      <div v-for="id in getGroupList(orderItems)" :key="id" >
        <div class="list-item list-header">
          <ion-item color="light" lines="none">
            <ion-label>{{ getParentInformation(id, orderItems).parentProductName }}</ion-label>
          </ion-item>

          <div class="tablet" />

          <div class="tablet" />

          <div />
          
          <ion-checkbox :checked="isParentProductChecked(id, orderItems)" @click="isParentProductUpdated = true" @ionChange="selectParentProduct(id, $event, orderItems)" />

          <ion-button fill="clear" color="medium" @click="UpdateProduct($event, id, true, getParentInformation(id, orderItems), getParentInformation(id, orderItems).orderId)">
            <ion-icon slot="icon-only" :icon="ellipsisVerticalOutline" />
          </ion-button>
        </div>
        <div v-for="(item, index) in getGroupItems(id, orderItems)" :key="index">
          <div class="list-item">
            <ion-item lines="none">
              <ion-thumbnail slot="start">
                <Image :src="item.imageUrl" />
              </ion-thumbnail>
              <ion-label class="ion-text-wrap">
                {{ item.internalName }}
              </ion-label>
            </ion-item>

            <ion-chip outline class="tablet">
              <ion-label>{{ item.isNewProduct === "Y"? $t("Preorder") : $t("Backorder") }}</ion-label>
            </ion-chip>

            <ion-chip outline>
              <ion-label>{{ item.quantityOrdered }} {{ $t("Ordered") }}</ion-label>
            </ion-chip>

            <ion-chip outline class="tablet">
              <ion-icon :icon="sendOutline" />
              <ion-label>{{ item.arrivalDate }}</ion-label>
            </ion-chip>

            <!-- Used :key as the changed value was not reflected -->
            <ion-checkbox :key="item.isSelected" :checked="item.isSelected" @ionChange="selectProduct(item, $event)"/>
            
            <ion-button fill="clear" color="medium" @click="UpdateProduct($event, item.internalName, false, item, item.orderId)">
              <ion-icon slot="icon-only" :icon="ellipsisVerticalOutline" />
            </ion-button>
          </div>
        </div>
      </div>

      </div>
      
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button :disabled="isDateInvalid()" @click="save">
          <ion-icon  :icon="cloudUploadOutline" />
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
import { DateTime } from 'luxon';
import { showToast } from '@/utils';
import { translate } from "@/i18n";
import { IonPage, IonHeader, IonToolbar, IonBackButton, IonTitle, IonContent, IonSearchbar, IonItem, IonThumbnail, IonLabel, IonInput, IonChip, IonIcon, IonButton, IonCheckbox, IonSelect, IonSelectOption, IonButtons, popoverController, IonFab, IonFabButton, alertController, modalController } from '@ionic/vue'
import { ellipsisVerticalOutline, sendOutline, checkboxOutline, cloudUploadOutline, arrowUndoOutline } from 'ionicons/icons'
import { hasError } from "@/utils";
import MissingSkuModal from "@/components/MissingSkuModal.vue"

export default defineComponent({
  name: 'PurchaseOrderDetail',
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
    IonTitle,
    IonLabel,
    IonInput,
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
      facilities: [] as any,
      queryString: "",
      searchedProduct: {} as any,
      isParentProductUpdated: false,
      isPOUploadedSuccessfully: false
    }
  },
  ionViewDidEnter(){
   this.fetchFacilities();
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
    isDateInvalid(){
      // Checked if any of the date format is different than the selected format.
      return Object.values(this.ordersList).map((orderItems: any) => orderItems).flat().some((item: any) => !DateTime.fromFormat(item.arrivalDate, this.dateTimeFormat).isValid);
    },
    async listMissingSkus() {
      const missingSkuModal = await modalController.create({
        component: MissingSkuModal,
        componentProps: { 'unidentifiedProductItems': this.ordersList.unidentifiedProductItems }
      });
      return missingSkuModal.present();
    }, 
    searchProduct(sku: any) {
      const product = this.getProduct(sku);
      this.searchedProduct = Object.values(this.ordersList).flat(1).find((item: any) => {
        return item.internalName === product.internalName;
      })
    },
    async save(){
      const uploadData = this.ordersList.items.filter((item: any) => {
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
    async UpdateProduct(ev: Event, id: any, isVirtual: boolean, item: any, poId: string) {
      const popover = await popoverController
        .create({
          component: ProductPopover,
          event: ev,
          translucent: true,
          showBackdrop: true,
          componentProps: { 'id': id, 'isVirtual': isVirtual, 'item': item, poId }
        });
        popover.onDidDismiss().then(() => {
          this.searchProduct(this.queryString);
        });
      return popover.present();
    },
    isParentProductChecked(parentProductId: string, orderItems: any) {
      const items = this.getGroupItems(parentProductId, orderItems);
      return items.every((item: any) => item.isSelected)
    },
    selectProduct(item: any, event: any) {
      item.isSelected = event.detail.checked;
    },
    revertAll() {
      let original = JSON.parse(JSON.stringify(this.originalItems));
      original = original.reduce((itemsByPoId: any, item: any) => {
      itemsByPoId[item.orderId] ? itemsByPoId[item.orderId].push(item) : itemsByPoId[item.orderId] = [item] 
      return itemsByPoId;
    }, {});
      this.store.dispatch('order/updatedOrderListItems', original);
    },
    apply() {
      Object.values(this.ordersList).map((orderItems: any) => orderItems).flat().map((item: any) => {
        if (item.isSelected) {
          item.quantityOrdered -= this.numberOfPieces;
          if(this.numberOfDays) item.arrivalDate = DateTime.fromFormat(item.arrivalDate, this.dateTimeFormat).plus({ days: this.numberOfDays }).toFormat(this.dateTimeFormat);
          item.isNewProduct = this.catalog;
          if(this.facilityId) {
            item.facilityId = this.facilityId;
            item.externalFacilityId = "";
          }
        }
      })
      this.store.dispatch('order/updatedOrderListItems', this.ordersList);
    },
    getGroupList (items: any) {
      return Array.from(new Set(items.map((ele: any) => ele.parentProductId)));
    },
    getGroupItems(parentProductId: any, items: any) {
      return items.filter((item: any) => item.parentProductId == parentProductId)
    },
    getParentInformation(id: any, items: any) {
      return items.find((item: any) => item.parentProductId == id)
    },
    selectAllItems() {
      Object.values(this.ordersList).map((orderItems: any) => orderItems).flat().forEach((item: any) => {
        item.isSelected = true;
      })
    },
    selectParentProduct(parentProductId: any, event: any, orderItems: any) {
      // Todo: Need to find a better approach.
      if(this.isParentProductUpdated){
        orderItems.forEach((item: any) => {
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
      sendOutline,
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

h3 {
  padding-left: 15px;
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