<template> 
  <div v-for="(orderItems, index) in ordersList" :key="index">
    <ion-item lines="none">
      <h3>{{ index }}</h3>
    </ion-item>
    
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
import { mapGetters } from 'vuex';
import ProductPopover from '@/components/ProductPopover.vue'

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
    ordersList: {
      type: Object
    }
  },
  computed: {
    ...mapGetters({
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
      facilityId: "",
      queryString: "",
      searchedProduct: {} as any,
      isParentProductUpdated: false,
      isPOUploadedSuccessfully: false
    }
  },
  methods: { 
    async UpdateProduct(ev: Event, id: any, isVirtual: boolean, item: any, poId: string) {
      const popover = await popoverController
        .create({
          component: ProductPopover,
          event: ev,
          translucent: true,
          showBackdrop: true,
          componentProps: { 'id': id, 'isVirtual': isVirtual, 'item': item, poId }
        });
        // popover.onDidDismiss().then(() => {
        //   this.searchProduct(this.queryString);
        // });
      return popover.present();
    },
    isParentProductChecked(parentProductId: string, orderItems: any) {
      const items = this.getGroupItems(parentProductId, orderItems);
      return items.every((item: any) => item.isSelected)
    },
    selectProduct(item: any, event: any) {
      item.isSelected = event.detail.checked;
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
    selectParentProduct(parentProductId: any, event: any, orderItems: any) {
      // Todo: Need to find a better approach.
      if(this.isParentProductUpdated){
        orderItems = orderItems.map((item: any) => {
          if (item.parentProductId === parentProductId) {
            item.isSelected = event.detail.checked;
          }
          return item;
        })
        this.isParentProductUpdated = false;
      }
    }
  },
  setup() {
    return {
      sendOutline,
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