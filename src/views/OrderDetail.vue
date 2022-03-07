<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/purchase-order" />
        <ion-title>{{ orderId }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="selectAllItems">
            <ion-icon :icon="checkboxOutline" />
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
          <ion-searchbar />
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
              <ion-select-option v-for="facility in facilities" :key="facility" :value="facility.externalId">{{ facility.facilityName }}</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-button expand="block" fill="outline" @click="apply">{{ $t("Apply") }}</ion-button>
        </div>
      </div>  

      <div v-for="id in getGroupList(ordersList.items)" :key="id" >
        <div v-for="item in getGroupItems(id, ordersList.items)" :key="item">
          <div class="list-header" >
            <ion-label>{{ item.parentProductName }}</ion-label>
            <div />
            <div />
            <div />
            <ion-checkbox :checked="isParentProductChecked(id)" @ionChange="selectParentProduct(id, $event)" />
            <ion-button fill="clear" color="medium" @click="UpdateProduct($event, id, false, item)"> 
              <ion-icon  :icon="ellipsisVerticalOutline" />
            </ion-button>
          </div>
          <div class="list-item">
            <ion-item  lines="none">
              <ion-thumbnail>
                <Image :src="item.imageUrl" />
              </ion-thumbnail>
              <ion-label>
                {{ item.internalName }}
              </ion-label>
            </ion-item>
            <ion-chip outline>
              <ion-label>{{ item.isNewProduct === "Y"? $t("Preorder") : $t("Backorder") }}</ion-label>
            </ion-chip>
            <ion-chip outline>
              <ion-label>{{ item.quantityOrdered }} {{ $t("Ordered") }}</ion-label>
            </ion-chip>
            <ion-chip outline>
              <ion-icon :icon="sendOutline" />
              <ion-label>{{ item.arrivalDate }}</ion-label>
            </ion-chip>
            <!-- Used :key as the changed value was not reflected -->
            <ion-checkbox :key="item.isSelected" :checked="item.isSelected" @ionChange="selectProduct(item, $event)"/>
            <ion-button fill="clear" color="medium" @click="UpdateProduct($event, item.internalName, true, item)">
              <ion-icon slot="icon-only" :icon="ellipsisVerticalOutline" />
            </ion-button>
          </div>
        </div>
      </div>
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="save" class="save">
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
import { IonPage, IonHeader, IonToolbar, IonBackButton, IonTitle, IonContent, IonSearchbar, IonItem, IonThumbnail, IonLabel, IonInput, IonChip, IonIcon, IonButton, IonCheckbox, IonSelect, IonSelectOption, IonButtons, popoverController, IonFab, IonFabButton } from '@ionic/vue'
import { ellipsisVerticalOutline, sendOutline, checkboxOutline, arrowUndoOutline, cloudUploadOutline } from 'ionicons/icons'
import { hasError } from "@/utils";
export default defineComponent({
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
      facilities: [] as any
    }
  },
  mounted(){
   this.fetchFacilities();
  },
  methods: {
    async save(){
      const uploadData = this.ordersList.items.map((item: any) => {
        return { 
          "poId": " ",
          "externalId": item.orderId,
          "facilityId": "",
          "externalFacilityId": item.facilityId,
          "arrivalDate": item.arrivalDate,
          "quantity": item.quantityOrdered,
          "isNewProduct": item.isNewProduct,
          "idValue": item.shopifyProductSKU,
          "idType": "SKU"
        }
      })
      const fileName = "Upload_PO_Member_" + Date.now() +".json";
      const params = {
        "configId": "IMP_PO"
      }
      const response = UploadService.uploadJsonFile(UploadService.prepareUploadJsonPayload({
        uploadData,
        fileName,
        params
      }));
    },
    async fetchFacilities(){
      const payload = {
        "inputFields": {
          "externalId_fld0_op": "not-empty",
        },
        "fieldList": ["externalId", "facilityName"],
        "entityName": "Facility",
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
    selectOnlyParentProduct(id: any){
      this.ordersList.items.forEach((item: any) => {
        item.isSelected = !item.parentProductId === id;
      })
    },
    isParentProductChecked(parentProductId: string) {
      return !(this as any).ordersList.items.filter((item: any) => item.parentProductId  === parentProductId).some((item: any) => {
        return !item.isSelected
      })
    },
    selectProduct(item: any, event: any) {
      item.isSelected = event.detail.checked;
    },
    apply() {
      this.ordersList.items.map((item: any) => {
        console.log(this.catalog);
        if (item.isSelected) {
          item.quantityOrdered -= this.numberOfPieces;
          item.arrivalDate = DateTime.fromFormat(item.arrivalDate, "D").plus({ days: this.numberOfDays }).toFormat('MM/dd/yyyy');
          item.isNewProduct = this.catalog;
          if(this.facilityId) {
            item.facilityId = this.facilityId;
          }
        }
      })
      this.store.dispatch('order/updatedOrderListItems', this.ordersList.items);
    },
    getGroupList (items: any) {
      return Array.from(new Set(items.map((ele: any) => ele.parentProductId)))
    },
    getGroupItems(parentProductId: any, items: any) {
      return items.filter((item: any) => item.parentProductId == parentProductId)
    },
    selectAllItems() {
      this.ordersList.items.forEach((item: any) => {
        item.isSelected = true;
      })
    },
    selectParentProduct(parentProductId: any, event: any) {
      this.ordersList.items.forEach((item: any) => {
        if (item.parentProductId == parentProductId) {
            item.isSelected = event.detail.checked;
        }
      })
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
      store
    }
  }
});

</script>
<style scoped>
.header {
  display: grid;
  grid: "search filters"
        /1fr 1fr;
  grid-gap: 16px;
  padding: 16px;
  margin-bottom: 16px;
}

.search {
  grid-area: search;
}

.filters {
  grid-area: filters;
}
/* TODO: Use universal list item class */
.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.list-header {
  display: flex;
  place-items: center;
  justify-content: space-between;
  background-color: #F4F5F8;
  padding-left: 10px;
}
.save {
  border-radius: 100%;
}

</style>