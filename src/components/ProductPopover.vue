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
      ordersList: 'order/getOrder',
      originalItems: 'order/getOriginalItems'
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
      Object.values(this.ordersList).flat(1).map(element => {
        element.isSelected = element.parentProductId === this.id;
      });
      popoverController.dismiss({ dismissed: true });
    },
    onlySelectSingleProduct() {
      Object.values(this.ordersList).flat(1).map(element => {
        element.isSelected = element.internalName === this.id;
      });
      popoverController.dismiss({ dismissed: true });
    },
    revertProduct() {
      const original = JSON.parse(JSON.stringify(this.originalItems));
      this.ordersList[this.poId] = this.ordersList[this.poId].map(element => {
        if(element.internalName === this.id) {
          const item = original.find(item => {
            return item.pseudoId === this.id;
          })
          element = item;
        }
        return element;
      });
      this.store.dispatch('order/updatedOrderListItems', this.ordersList)
      popoverController.dismiss({ dismissed: true });
    },
    revertParentProduct(){
      const original = JSON.parse(JSON.stringify(this.originalItems));
      this.ordersList[this.poId] = this.ordersList[this.poId].map(element => {
        if(element.parentProductId === this.id) {
          const item = original.find(item => {
            return item.parentProductId === this.id && item.shopifyProductSKU === element.shopifyProductSKU;
          })
          element = item;
        }
        return element;
      });
      this.store.dispatch('order/updatedOrderListItems', this.ordersList)
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