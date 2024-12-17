<template> 
  <div v-for="(poItems, index) in itemsByPoId" :key="index">
    <ion-item lines="none">
      <h3>{{ index }}</h3>
    </ion-item>
    
    <div v-for="id in getGroupPurchaseOrders(poItems)" :key="id" >
      <div class="list-item list-header">
        <ion-label class="ion-padding-start">{{ getParentInformation(id, poItems).parentProductName }}</ion-label>

        <div class="tablet" />

        <div class="tablet" />

        <div />
        
        <ion-checkbox aria-label="select-virtual" :checked="isParentProductChecked(id, poItems)" @click="isParentProductUpdated = true" @ionChange="selectParentProduct(id, $event, poItems)" />
        
        <ion-button fill="clear" color="medium" @click="openProductPopover($event, id, true, getParentInformation(id, poItems), getParentInformation(id, poItems).orderId)">
          <ion-icon slot="icon-only" :icon="ellipsisVerticalOutline" />
        </ion-button>
      </div>
      <div v-for="(item, index) in getGroupedItems(id, poItems)" :key="index">
        <div class="list-item">
          <ion-item lines="none">
            <ion-thumbnail slot="start">
              <DxpShopifyImg :src="item.imageUrl" size="small" />
            </ion-thumbnail>
            <ion-label class="ion-text-wrap">
              <h3>{{ getProductIdentificationValue(productIdentificationPref.primaryId, getProduct(item.pseudoId)) ? getProductIdentificationValue(productIdentificationPref.primaryId, getProduct(item.pseudoId)) : item.pseudoId }}</h3>
              <p>{{ getProductIdentificationValue(productIdentificationPref.secondaryId, getProduct(item.pseudoId)) }}</p>
            </ion-label>
          </ion-item>
          <ion-chip outline class="tablet">
            <ion-label>{{ item.isNewProduct === "Y"? translate("Preorder") : translate("Backorder") }}</ion-label>
          </ion-chip>
          <ion-chip outline>
            <ion-label>{{ item.quantityOrdered }} {{ translate("Ordered") }}</ion-label>
          </ion-chip>
          <ion-chip outline class="tablet">
            <ion-icon :icon="sendOutline" />
            <ion-label>{{ getArrivalDate(item.arrivalDate) }}</ion-label>
          </ion-chip>
          <!-- Used :key as the changed value was not reflected -->
          <ion-checkbox aria-label="select-variant" :key="item.isSelected" :checked="item.isSelected" @ionChange="selectProduct(item, $event)"/>
          
          <ion-button fill="clear" color="medium" @click="openProductPopover($event, item.pseudoId, false, item, item.orderId)">
            <ion-icon slot="icon-only" :icon="ellipsisVerticalOutline" />
          </ion-button>
        </div>
      </div>
    </div>
  </div>     
</template>
<script lang="ts"> 
import { DxpShopifyImg } from "@hotwax/dxp-components";
import {
  IonCheckbox,
  IonThumbnail,
  IonChip,  
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  popoverController
} from "@ionic/vue";
import { sendOutline, ellipsisVerticalOutline } from 'ionicons/icons';
import { defineComponent } from "@vue/runtime-core";
import { mapGetters, useStore } from "vuex";
import ProductPopover from '@/components/ProductPopover.vue'
import { DateTime } from 'luxon';
import { getProductIdentificationValue, translate, useProductIdentificationStore } from "@hotwax/dxp-components";
import { computed } from "vue";

export default defineComponent({
  name: "PurchaseOrderDetails",
  components: {
    IonCheckbox,
    IonThumbnail,
    IonChip,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    DxpShopifyImg
  },
  props: {
    purchaseOrders: {
      type: Object
    },
    itemsByPoId: {
      type: Object
    }
  },
  computed: {
    ...mapGetters({
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
  methods: { 
    async openProductPopover(ev: Event, id: any, isVirtual: boolean, item: any, poId: string) {
      const popover = await popoverController
        .create({
          component: ProductPopover,
          event: ev,
          translucent: true,
          showBackdrop: true,
          componentProps: { 'id': id, 'isVirtual': isVirtual, 'item': item, poId, 'type': 'order' }
        });
      return popover.present();
    },
    getArrivalDate(date: any){
      return DateTime.fromFormat(date, this.dateTimeFormat).toFormat(this.dateTimeFormat)
    },
    isParentProductChecked(parentProductId: string, poItems: any) {
      const items = this.getGroupedItems(parentProductId, poItems);
      return items.every((item: any) => item.isSelected)
    },
    selectProduct(item: any, event: any) {
      item.isSelected = event.detail.checked;
      this.store.dispatch('order/updatePurchaseOrders', this.purchaseOrders);
    },
    getGroupPurchaseOrders (items: any) {
      return Array.from(new Set(items.map((ele: any) => ele.parentProductId)));
    },
    getGroupedItems(parentProductId: any, items: any) {
      return items.filter((item: any) => item.parentProductId == parentProductId)
    },
    getParentInformation(id: any, items: any) {
      return items.find((item: any) => item.parentProductId == id)
    },
    selectParentProduct(parentProductId: any, event: any, poItems: any) {
      // TODO: Need to find a better approach.
      // Added a flag isParentProductUpdated so that it does not deselect all the products under parent product on deselcting a single product.
      if(this.isParentProductUpdated){
        poItems.map((item: any) => {
          if (item.parentProductId === parentProductId) {
            item.isSelected = event.detail.checked;
          }
          return item;
        })
        this.isParentProductUpdated = false;
      }
      this.store.dispatch('order/updatePurchaseOrders', this.purchaseOrders)
    }
  },
  setup() {
    const store = useStore();
    const productIdentificationStore = useProductIdentificationStore();
    let productIdentificationPref = computed(() => productIdentificationStore.getProductIdentificationPref);

    return {
      getProductIdentificationValue,
      sendOutline,
      store,
      ellipsisVerticalOutline,
      productIdentificationPref,
      translate
    }
  }
})
</script>
<style scoped>
  .list-item {
    --columns-tablet: 4;
    --columns-desktop: 6;
    border-bottom: #92949C 1px solid;
  }
  
  /* Added width property as after updating to ionic7 min-width is getting applied on ion-label inside ion-item
  which results in distorted label text and thus reduced ion-item width */
  .list-item > ion-item {
    width: 100%;
  }

  .list-item :first-child ion-label {
    word-break: break-all;
  }
  
  .list-header {
    background-color: var(--ion-color-light);
  }
  
  h1 {
    margin-left: 15px;
  }
</style>