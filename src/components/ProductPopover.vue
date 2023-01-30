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
  props: ['id', 'isVirtual', 'item', 'type'],
  name: 'parentProductPopover',
  components: { IonContent, IonIcon, IonLabel, IonItem },
  computed: {
    ...mapGetters({
      ordersList: 'order/getOrder',
      stock: 'stock/getItemsStock'
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
      let items = this.type === 'order' ? this.ordersList.items : this.stock.parsed;
      items = items.map(item => {
        item.isSelected = item.parentProductId === this.id;
        return item;
      });
      popoverController.dismiss({ dismissed: true });
    },
    onlySelectSingleProduct() {
      let items = this.type === 'order' ? this.ordersList.items : this.stock.parsed;
      items = items.map(item => {
        item.isSelected = item.pseudoId === this.id;
      });
      popoverController.dismiss({ dismissed: true });
    },
    revertProduct() {
      const items = this.type === 'order' ? this.ordersList.items : this.stock.parsed;
      const original = this.type === 'order' ? JSON.parse(JSON.stringify(this.ordersList.original)) : JSON.parse(JSON.stringify(this.stock.original));
      const itemsList = items.map(element => {
        if(element.pseudoId === this.id) {
          const item = original.find(item => {
            return item.pseudoId === this.id;
          })
          element = item;
        }
        return element;
      });
      this.type === 'order' ? this.store.dispatch('order/updatedOrderListItems', itemsList) : this.store.dispatch('stock/updatedStockListItems', itemsList)
      popoverController.dismiss({ dismissed: true });
    },
    revertParentProduct(){
      const items = this.type === 'order' ? this.ordersList.items : this.stock.parsed;
      const original = this.type === 'order' ? JSON.parse(JSON.stringify(this.ordersList.original)) : JSON.parse(JSON.stringify(this.stock.original));
      const itemsList = items.map(element => {
        if(element.parentProductId === this.id) {
          const item = original.find(item => {
            return item.parentProductId === this.id && item.shopifyProductSKU === element.shopifyProductSKU;
          })
          element = item;
        }
        return element;
      });
      this.type === 'order' ? this.store.dispatch('order/updatedOrderListItems', itemsList) : this.store.dispatch('stock/updatedStockListItems', itemsList);
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