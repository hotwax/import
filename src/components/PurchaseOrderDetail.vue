<template> 
  <div v-for="(poItems, index) in itemsByPoId" :key="index">
    <ion-item lines="none">
      <h3>{{ index }}</h3>
    </ion-item>
    
    <div v-for="id in getGroupPurchaseOrders(poItems)" :key="id" >
      <div class="list-item list-header">
        <ion-item color="light" lines="none">
          <ion-label>{{ getParentInformation(id, poItems).parentProductName }}</ion-label>
        </ion-item>

        <div class="tablet" />

        <div class="tablet" />

        <div />
        
        <ion-checkbox :checked="isParentProductChecked(id, poItems)" @click="isParentProductUpdated = true" @ionChange="selectParentProduct(id, $event, poItems)" />
        
        <ion-button fill="clear" color="medium" @click="openProductPopover($event, id, true, getParentInformation(id, poItems), getParentInformation(id, poItems).orderId)">
          <ion-icon slot="icon-only" :icon="ellipsisVerticalOutline" />
        </ion-button>
      </div>
      <div v-for="(item, index) in getGroupedItems(id, poItems)" :key="index">
        <div class="list-item">
          <ion-item lines="none">
            <ion-thumbnail slot="start">
              <Image :src="item.imageUrl" />
            </ion-thumbnail>
            <ion-label class="ion-text-wrap">
              <h3>{{ item.pseudoId }}</h3>
              <p v-if="item.initialSKU">{{ item.initialSKU }}</p>
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
            <ion-label>{{ getArrivalDate(item.arrivalDate) }}</ion-label>
          </ion-chip>
          <!-- Used :key as the changed value was not reflected -->
          <ion-checkbox :key="item.isSelected" :checked="item.isSelected" @ionChange="selectProduct(item, $event)"/>
          
          <ion-button fill="clear" color="medium" @click="openProductPopover($event, item.pseudoId, false, item, item.orderId)">
            <ion-icon slot="icon-only" :icon="ellipsisVerticalOutline" />
          </ion-button>
        </div>
      </div>
    </div>
  </div>     
</template>
<script lang="ts"> 
import Image from '@/components/Image.vue';
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
import { DateTime } from 'luxon'

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
    Image
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
    return {
      sendOutline,
      store,
      ellipsisVerticalOutline
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