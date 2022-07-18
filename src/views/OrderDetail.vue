<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" @click="navigateBack" default-href="/purchase-order" />
        <ion-title>{{ orderId }}</ion-title>
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
            <ion-select v-model="catalog">
              <ion-select-option value="N">{{ $t("Backorder") }}</ion-select-option>
              <ion-select-option value="Y">{{ $t("Preorder") }}</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label>{{ $t("Facility") }}</ion-label>
            <ion-select v-model="facilityId">
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
        
        <ion-button fill="clear" color="medium" @click="UpdateProduct($event, searchedProduct.internalName, true, searchedProduct)">
          <ion-icon slot="icon-only" :icon="ellipsisVerticalOutline" />
        </ion-button>
      </div>

      <div v-else v-for="id in getGroupList(ordersList.items)" :key="id" >
        <div class="list-item list-header">
          <ion-item color="light" lines="none">
            <ion-label>{{ getParentInformation(id, ordersList.items).parentProductName }}</ion-label>
          </ion-item>

          <div class="tablet" />

          <div class="tablet" />

          <div />
          
          <ion-checkbox :checked="isParentProductChecked(id)" @click="handleChange(true)" @ionChange="selectParentProduct(id, $event)" />

          <ion-button fill="clear" color="medium" @click="UpdateProduct($event, id, true, getParentInformation(id, ordersList.items))">
            <ion-icon slot="icon-only" :icon="ellipsisVerticalOutline" />
          </ion-button>
        </div>
        <div v-for="(item, index) in getGroupItems(id, ordersList.items)" :key="index">
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
            
            <ion-button fill="clear" color="medium" @click="UpdateProduct($event, item.internalName, false, item)">
              <ion-icon slot="icon-only" :icon="ellipsisVerticalOutline" />
            </ion-button>
          </div>
        </div>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="save">
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
    IonTitle,
    IonContent,
    IonSearchbar,
    IonItem,
    IonThumbnail,
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
      getProduct: 'product/getProduct',
      instanceUrl: 'user/getInstanceUrl'
    }),
    orderId(){
      return (this as any).ordersList.items[0]?.orderId
    }
  },
  data() {
    return {
      numberOfDays: 0,
      numberOfPieces: 0,
      catalog: "N",
      facilityId: "",
      facilities: [] as any,
      queryString: "",
      searchedProduct: {} as any,
      handleOnChange: false
    }
  },
  ionViewDidEnter(){
   this.fetchFacilities();
  },
  methods: {
    handleChange(value: any){
      this.handleOnChange = value;
    },
    async listMissingSkus() {
      const missingSkuModal = await modalController.create({
        component: MissingSkuModal,
        componentProps: { 'unidentifiedProductItems': this.ordersList.unidentifiedProductItems }
      });
      return missingSkuModal.present();
    },
    async navigateBack(){
      const alert = await alertController.create({
        header: this.$t("Leave page"),
        message: this.$t("Any edits made to this PO will be lost."),
        buttons: [
            {
              text: this.$t("STAY"),
              role: 'cancel',
            },
            {
              text: this.$t("LEAVE"),
              handler: () => {
                this.router.push("/purchase-order");
              },
            },
          ],
      });
      return alert.present();
    },  
    searchProduct(sku: any) {
      const product = this.getProduct(sku);
      this.searchedProduct = this.ordersList.items.find((item: any) => {
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
          "arrivalDate": item.arrivalDate,
          "quantity": item.quantityOrdered,
          "isNewProduct": item.isNewProduct,
          "idValue": item.shopifyProductSKU,
          "idType": "SKU"
        };
      })
      const fileName = "Upload_PO_Member_" + Date.now() +".json";
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
                const response = UploadService.uploadJsonFile(UploadService.prepareUploadJsonPayload({
                  uploadData,
                  fileName,
                  params
                })).then(() => {
                  showToast(translate("The PO has been uploaded successfully"), [{
                    text: translate('View'),
                    role: 'view',
                    handler: () => {
                      window.location.href = `https://${this.instanceUrl}.hotwax.io/commerce/control/ImportData?configId=IMP_PO`
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
    async UpdateProduct(ev: Event, id: any, isVirtual: boolean, item: any) {
      const popover = await popoverController
        .create({
          component: ProductPopover,
          event: ev,
          translucent: true,
          showBackdrop: true,
          componentProps: { 'id': id, 'isVirtual': isVirtual, 'item': item }
        })
      return popover.present();
    },
    isParentProductChecked(parentProductId: string) {
      const items = (this as any).getGroupItems(parentProductId, this.ordersList.items);
      return items.every((item: any) => item.isSelected)
    },
    selectProduct(item: any, event: any) {
      item.isSelected = event.detail.checked;
    },
    revertAll() {
      const original = JSON.parse(JSON.stringify(this.ordersList.original));
      this.store.dispatch('order/updatedOrderListItems', original);
    },
    apply() {
      this.ordersList.items.map((item: any) => {
        if (item.isSelected) {
          item.quantityOrdered -= this.numberOfPieces;
          item.arrivalDate = DateTime.fromFormat(item.arrivalDate, process.env.VUE_APP_DATE_FORMAT ? process.env.VUE_APP_DATE_FORMAT : 'MM/dd/yyyy').plus({ days: this.numberOfDays }).toFormat(process.env.VUE_APP_DATE_FORMAT ? process.env.VUE_APP_DATE_FORMAT : 'MM/dd/yyyy');
          item.isNewProduct = this.catalog;
          if(this.facilityId) {
            item.facilityId = this.facilityId;
            item.externalFacilityId = "";
          }
        }
      })
      this.store.dispatch('order/updatedOrderListItems', this.ordersList.items);
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
      this.ordersList.items.forEach((item: any) => {
        item.isSelected = true;
      })
    },
    selectParentProduct(parentProductId: any, event: any) {
      if(this.handleOnChange){
        this.ordersList.items.forEach((item: any) => {
          if (item.parentProductId === parentProductId) {
            item.isSelected = event.detail.checked;
          }
        })
      }
      this.handleOnChange = false;
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