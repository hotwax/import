<template>
  <ion-content>
    <ion-item lines="none">
      <ion-label>{{ this.isVirtual ? item.parentProductName : item.pseudoId }}</ion-label>
    </ion-item>
    <ion-item button lines="none" @click="revert">
      <ion-icon slot="start" :icon="arrowUndoOutline" />
      <ion-label>{{ $t('Reset') }}</ion-label>
    </ion-item>
    <ion-item button lines="none" @click="onlySelect">
      <ion-icon slot="start" :icon="checkboxOutline" />
      <ion-label>{{ $t('Only select') }}</ion-label>
    </ion-item>
  </ion-content>
</template>

<script>
import { IonContent, IonIcon, IonLabel, IonItem, popoverController } from '@ionic/vue';
import { defineComponent } from 'vue';
import { mapGetters, useStore } from "vuex";
import {
  checkboxOutline,
  arrowUndoOutline
} from 'ionicons/icons';
export default defineComponent({
  props: ['id', 'isVirtual', 'item', 'poId'],
  name: 'parentProductPopover',
  components: { IonContent, IonIcon, IonLabel, IonItem },
  computed: {
    ...mapGetters({
      purchaseOrders: 'order/getPurchaseOrders',
    }),
  },
  methods: {
    revert() {
      this.isVirtual ? this.revertParentProduct() : this.revertProduct();
    },
    onlySelect() {
      this.isVirtual ? this.onlySelectParentProduct() : this.onlySelectSingleProduct();
    },
    onlySelectParentProduct() {
      Object.values(this.purchaseOrders.parsed).flat().map(item => {
        item.isSelected = item.parentProductId === this.id && item.orderId === this.poId;
      });
      popoverController.dismiss({ dismissed: true });
    },
    onlySelectSingleProduct() {
      Object.values(this.purchaseOrders.parsed).flat().map(item => {
        item.isSelected = item.pseudoId === this.id && item.orderId === this.poId;
      });
      popoverController.dismiss({ dismissed: true });
    },
    revertProduct() {
      const original = this.purchaseOrders.original;
      this.purchaseOrders.parsed[this.poId] = this.purchaseOrders.parsed[this.poId].map(element => {
        if(element.pseudoId === this.id) {
          const item = original[this.poId].find(item => {
            return item.pseudoId === this.id;
          })
          element = item;
        }
        return element;
      });
      this.store.dispatch('order/updatePurchaseOrders', this.purchaseOrders)
      popoverController.dismiss({ dismissed: true });
    },
    revertParentProduct(){
      const original = this.purchaseOrders.original;
      this.purchaseOrders.parsed[this.poId] = this.purchaseOrders.parsed[this.poId].map(element => {
        if(element.parentProductId === this.id) {
          const item = original[this.poId].find(item => {
            // shopifyProductSKU check prevents reverting all the items of parent product to the first one as all the products have same parent product Id. 
            return item.parentProductId === this.id && item.shopifyProductSKU === element.shopifyProductSKU;
          })
          element = item;
        }
        return element;
      });
      this.store.dispatch('order/updatePurchaseOrders', this.purchaseOrders)
      popoverController.dismiss({ dismissed: true });
    }
  },
  setup() {
    const store = useStore();
    return {
      checkboxOutline,
      arrowUndoOutline,
      store
    }
  }
});
</script>